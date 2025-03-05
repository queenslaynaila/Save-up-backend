import { z } from 'zod';
import { sql } from '../../db';
import HttpError from '../../httpError';
import Router from '../../router';
import { publicUserSchema, UserWithPublicAttributes } from '../auth/login';
import { UserRole } from './schema';

const SQL_GET_USER_BY_CRITERIA = sql<Record<string, never>, UserWithPublicAttributes>(`
  SELECT 
    users.id, 
    users.id_type, 
    users.id_number,
    user_contact_details.full_name, 
    users.role, 
    users.gender, 
    user_contact_details.phone_number,  
    users.created_at
  FROM 
    users
  LEFT JOIN 
    user_contact_details ON users.id = user_contact_details.id
`);

const getUsersByUserId = (router: Router) => {
  router.route({
    method: 'get',
    path: '/:user_id',
    summary: 'Get user by user ID',
    request: {
      query: z.object({
        phone_number: z.string(),
        id_number: z.string(),
        user_id: z.string().optional(),
        limit: z.string().default('10')
      }).partial()
    },
    response: {
      200: {
        schema: z.array(publicUserSchema)
      }
    },
    authMiddlewareOptions: {roles: [UserRole.Enum.Admin, UserRole.Enum.Moderator]},
    handler: async (req, res) => {
      const { phone_number, id_number, limit = 10, user_id } = req.query;

      const requestedUserId = user_id === 'me' || user_id === undefined
        ? req.user!.id : parseInt(user_id!, 10);

      if (Number.isNaN(requestedUserId)) {
        throw new HttpError(400);
      }

      if (req.user!.role === UserRole.Enum.Standard
        && requestedUserId !== req.user!.id) {
        throw new HttpError(403);
      }

      const filters: string[] = [];
      const filterArgs: Record<string, string | number> = { limit };

      if (requestedUserId !== null) {
        filterArgs.user_id = requestedUserId;
        filters.push('users.id = :user_id');
      }

      if (phone_number) {
        filterArgs.phone_number = `+${phone_number}`;
        filters.push('user_contact_details.phone_number = :phone_number');
      }

      if (id_number) {
        filterArgs.id_number = id_number;
        filters.push('users.id_number = :id_number');
      }

      const query = SQL_GET_USER_BY_CRITERIA({});
      query.extend(`WHERE ${filters.join(' AND ')} LIMIT :limit`, filterArgs);
      const users = await query.many();

      res.json(users);
    }
  });
};

export default getUsersByUserId;