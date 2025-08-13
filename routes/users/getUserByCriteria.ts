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

      if (!/^[\dA-Za-z+]+$/.test(sanitizedValue)) {
       throw new HttpError(400);
      }

      const query = SQL_GET_USER_BY_CRITERIA({});

      query.extend(
        `WHERE user_contact_details.phone_number LIKE :prefix
          OR users.id_number LIKE :prefix
        LIMIT 10`,
       { prefix: sanitizedValue + '%' }
      );
      const users = await query.many();
      res.json(users);
    }
  });
};

export default getUsersBySearchCriteria;