import { z } from 'zod';
import { sql } from '../../db';
import HttpError from '../../httpError';
import Router from '../../core/router';
import { publicUserSchema, UserWithPublicAttributes } from '../auth/login';
import { UserRole } from './schema';

const SQL_GET_USER_BY_CRITERIA = sql<
Record<string, never>,
UserWithPublicAttributes & {last_login: string}
>(`
  SELECT 
    users.id,
    users.id_type,
    users.id_number,
    user_contact_details.full_name,
    users.role,
    users.country,
    users.gender,
    user_contact_details.phone_number,
    users.created_at,
    login_attempts.created_at AS last_login
  FROM users
  LEFT JOIN user_contact_details 
    ON users.id = user_contact_details.id
  LEFT JOIN (
    SELECT user_id, MAX(xid) AS max_xid
    FROM login_attempts
    GROUP BY user_id
  ) AS latest
    ON users.id = latest.user_id
  LEFT JOIN login_attempts
    ON login_attempts.user_id = latest.user_id 
    AND login_attempts.xid = latest.max_xid
`);

const getUsersBySearchCriteria = (router: Router) => {
  router.get({
    path: '/search',
    summary: 'Search for users based by phone no / id number.',
    description: 'Allows searching for users based on a single query criterion: '
                + 'phone number, ID number, or user ID.',
    schema: {
      query: z.object({
        value: z.string()
      })
    },
    response: {
      statusCode: 200,
      schema: z.array(publicUserSchema.extend({
        last_login: z.string()
      }))
    },
    auth: [UserRole.enum.Admin, UserRole.enum.Moderator],
    handler: async (req, res) => {
      const { value } = req.query;
      const sanitizedValue = value.replace(/^ /, '+');

      const filters: string[] = [];
      const filterArgs: Record<string, string | number> = {};

      if (/^\+\d{10,16}$/.test(sanitizedValue)) {
        filters.push('user_contact_details.phone_number = :phone_number');
        filterArgs.phone_number = sanitizedValue;
      } else if (/^(?:[A-Z]{1,2}\d{6,9}|\d{8,10}|\d{13}|\d{16})$/
        .test(sanitizedValue)) {
        filters.push('users.id_number = :id_number');
        filterArgs.id_number = sanitizedValue;
      } else if (/^\d+$/.test(sanitizedValue)) {
        filters.push('users.id = :user_id');
        filterArgs.user_id = parseInt(sanitizedValue, 10);
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