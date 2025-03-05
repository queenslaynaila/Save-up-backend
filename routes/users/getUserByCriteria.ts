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

const getUsersBySearchCriteria = (router: Router) => {
  router.route({
    method: 'get',
    path: '/search',
    summary: 'Search for users based on various criteria.Admin/mod only',
    description: 'This endpoint allows searching for users based on a single query criterion: phone number, ID number, or user ID.',
    request: {
      query: z.object({
        value: z.string(),
      })
    },
    response: {
      200: {
        schema: z.array(publicUserSchema)
      }
    },
    authMiddlewareOptions: {roles: [UserRole.Enum.Admin, UserRole.Enum.Moderator]},
    handler: async (req, res) => {
      const { value } = req.query;

      const filters: string[] = [];
      const filterArgs: Record<string, string | number> = {};

      if (/^\d+$/.test(value)) {
        filters.push('users.id = :user_id');
        filterArgs.user_id = parseInt(value, 10);
      } else if (/^\+\d{1,4}\d{9}$/.test(value)) {
        filters.push('user_contact_details.phone_number = :phone_number');
        filterArgs.phone_number = value;
      } else if (/^(?:\d{8}|\d{9}(\d{4})?|\d{10}|\d{13}|\d{16})$/.test(value)) {
        filters.push('users.id_number = :id_number');
        filterArgs.id_number = value;
      } else {
        throw new HttpError(400);
      }

      const query = SQL_GET_USER_BY_CRITERIA({});
      query.extend(`WHERE ${filters}`, filterArgs);
      const users = await query.many();

      res.json(users);
    }
  });
};

export default getUsersBySearchCriteria;