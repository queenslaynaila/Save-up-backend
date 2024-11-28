import { z } from 'zod';
import { sql } from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
import Router from '../../router';
import { publicUserSchema, UserWithPublicAttributes } from '../auth/login';
import { UserRole } from '../../globalTypes';

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
    path: '/',
    summary: 'Search for users based on various criteria',
    description: 'This endpoint allows searching for users based on various query criteria such as phone number, ID number, passport number, or the string "me" for the currently logged-in user.\n'
      + '- **Phone number**: A user’s phone number (e.g., +254123456789).\n'
      + '- **ID number**: A user’s identification number (e.g., 123456 or 987654321).\n'
      + '- **Passport number**: A user’s passport number (e.g., A12345678).\n'
      + '- **"me"**: The string "me" can be used to fetch details of the currently logged-in user.\n\n'
      + 'Standard users can only access their own details by using "me", while moderators and admins have access to query any user using any of the above identifiers.\n\n'
      + 'If no limit is provided, the default is 10. At least one query parameter must be provided to avoid retrieving all users.',
    schema: {
      query: z.object({
        phone_number: z.string(),
        id_type: z.string(),
        id_number: z.string(),
        me: z.string(),
        limit: z.number().optional().default(10)
      }).partial()
    },
    response: {
      schema: z.array(publicUserSchema),
      statusCode: 200
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      if (Object.keys(req.query).length === 0) {
        throw new HttpError(400);
      }

      const { phone_number, id_type, id_number, me, limit = 10 } = req.query;

      if (me === 'me' && req.user!.role === UserRole.USER) {
        throw new HttpError(403);
      }

      const filters: string[] = [];
      const filterArgs: Record<string, string | number> = { limit };

      if (me) {
        filterArgs.me = req.user!.id;
        filters.push('users.id = :me');
      }

      if (phone_number) {
        filterArgs.phone_number = phone_number;
        filters.push('user_contact_details.phone_number = :phone_number');
      }

      if (id_type) {
        filterArgs.id_type = id_type;
        filters.push('users.id_type = :id_type');
      }

      if (id_number) {
        filterArgs.id_number = id_number;
        filters.push('users.id_number = :id_number');
      }

      const query = SQL_GET_USER_BY_CRITERIA({});
      const users = await query.extend(`WHERE ${filters.join(' AND ')} LIMIT :limit`, filterArgs).many();

      res.json(users);
    }
  });
};

export default getUsersBySearchCriteria;