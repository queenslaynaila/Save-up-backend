import { z } from 'zod';
import { sql } from '../../db';
import HttpError from '../../httpError';
import Router from '../../router';
import { publicUserSchema, UserWithPublicAttributes } from '../auth/login';
import { USER_ROLE_ENUM } from './schema';

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
      + '- **Phone number**: A user’s phone number (e.g., +254123456789).Note for phone numbers dont send the plus sign instaed of  +254123456789 send this 254123456789 the rule will be applied globally for all country codes \n'
      + '- **ID number**: A user’s identification number (e.g., 123456 or 987654321).\n'
      + '- **Passport number**: A user’s passport number (e.g., A12345678).\n'
      + '- **"me"**: The string "me" can be used to fetch details of the currently logged-in user.\n\n'
      + 'Standard users can only access their own details by using "me". Moderators and admins have access to query any user using any of the above identifiers.\n\n'
      + 'If no limit is provided, the default is 10.If no query parameter is provided, the default query parameter "me" will be used to fetch the logged-in user\'s details.',
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
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const { phone_number, id_number, limit = 10, user_id } = req.query;

      const requestedUserId = user_id === 'me' || user_id === undefined
        ? req.user!.id : parseInt(user_id!, 10);

      if (Number.isNaN(requestedUserId)) {
        throw new HttpError(400);
      }

      if (req.user!.role === USER_ROLE_ENUM.Enum.Standard
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

export default getUsersBySearchCriteria;