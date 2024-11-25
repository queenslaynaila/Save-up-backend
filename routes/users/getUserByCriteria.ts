import { z } from 'zod';
import { sql } from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/authorization';
import Router from '../../router';
import { safeUser } from './login';

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

const getUserByCriteria = (router: Router) => {
  router.route({
    method: 'get',
    path: '/:entity',
    summary: 'Get a user by criteria.',
    description: 'The entity string can be a user\'s phone number, ID number, or passport number. '
          + 'It can also be  a string me to get the logged in user\'s details.'
          + 'A standard user can only send the param string me, moderators '
          + 'and admin can do all',
    schema: {
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

      const filters: string[] = [];
      const filterArgs: Record<string, string | number> | [string] | string = {};

      if (targetUser !== 'me' && req.user!.role === 'Standard') {
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

      const query = SQL_GET_USER_BY_CRITERIA({});

      if (filters.length > 0) query.extend(`WHERE ${filters.join(' AND ')}`, filterArgs);
      query.extend('LIMIT 15', {});
      const users = await query.many();
      res.json(users);
    }
  });
};

export default getUserByCriteria;