import { z } from 'zod';
import { sql } from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/authorization';
import isStandardUser from '../../middleware/isStandardUser';
// import { loggedInUser } from './login';
import { userContactDetailsSchema } from './types';
import Router from '../../router';

export const loggedInUser = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
  pin: z.string() // This is the field we want to omit
  // other fields...
});

export const safeUser = loggedInUser.omit({
  pin: true
});
type UserSafe = z.infer<typeof safeUser>;

const SQL_GET_USER_BY_CRITERIA = sql<Record<string, never>, UserSafe>(`
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

const PHONE_REGEX = /^\+254\d{9}$/;
const ID_REGEX = /^\d{6,13}$/;
const PASSPORT_REGEX = /^[A-Za-z0-9]{9,16}$/i;

const userQuerySchema = userContactDetailsSchema.pick({
  full_name: true,
  phone_number: true
}).partial();

const getUserByCriteria = (router: Router) => {
  router.route({
    method: 'get',
    path: '/:entity',
    summary: 'Get a user by criteria',
    schema: {
      query: userQuerySchema,
      params: z.object({
        entity: z.string()
      })
    },
    response: {
      schema: z.array(safeUser),
      statusCode: 200
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      const targetUser = req.params.entity;
      const { full_name, phone_number } = req.query;

      const filters: string[] = [];
      const filterArgs: Record<string, string | number> = {};

      if (targetUser !== 'me' && isStandardUser(req.user!.role)) {
        throw new HttpError(403);
      }

      if (targetUser === 'me') {
        filterArgs.loggedInUserId = req.user!.id;
        filters.push('users.id = :loggedInUserId');
      } else if (ID_REGEX.test(targetUser)) {
        filterArgs.idNumber = targetUser;
        filters.push('users.id_number = :idNumber');
      } else if (PHONE_REGEX.test(targetUser)) {
        filterArgs.phoneNumber = targetUser;
        filters.push('user_contact_details.phone_number = :phoneNumber');
      } else if (PASSPORT_REGEX.test(targetUser)) {
        filterArgs.idNumber = targetUser;
        filters.push('users.id_number = :idNumber');
      } else {
        throw new HttpError(400);
      }

      if (full_name) {
        filterArgs.fullName = Array.isArray(full_name)
          ? full_name[0] as string
          : full_name as string;
        filters.push('user_contact_details.full_name = :fullName');
      }

      if (phone_number) {
        filterArgs.phoneNumber = Array.isArray(phone_number)
          ? phone_number[0] as string
          : phone_number as string;
        filters.push('user_contact_details.phone_number = :phoneNumber');
      }

      const query = SQL_GET_USER_BY_CRITERIA({});

      if (filters.length > 0) query.extend(`WHERE ${filters.join(' AND ')}`, filterArgs);
      query.extend('LIMIT 15', {});
      const users = await query.many();
      res.json(users);
    }
  });
};

export default getUserByCriteria;