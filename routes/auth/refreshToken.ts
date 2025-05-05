import Router from '../../router';
import { z } from 'zod';
import { AuthenticatedUser, publicUserSchema } from './login';
import Config from '../../config';
import jwt from 'jsonwebtoken';
import { sql } from '../../db';
import HttpError from '../../httpError';
import { generateToken } from '../../utils';

const SQL_GET_USER = sql<{ id: number }, AuthenticatedUser>(`
  SELECT 
    users.id, 
    users.id_type, 
    users.id_number,
    user_contact_details.phone_number, 
    user_contact_details.full_name, 
    users.role, 
    users.gender, 
    users.pin,
    users.created_at
  FROM users
  LEFT JOIN user_contact_details 
    ON users.id = user_contact_details.id
  WHERE users.id = :id
`);

const getRefreshToken = (router: Router) => {
  router.post({
    path: '/refresh',
    summary: 'Get a refresh token',
    schema: {
      body: z.object({
        token: z.string()
      })
    },
    response: {
      statusCode: 200,
      schema: publicUserSchema.pick({
        id: true,
        role: true,
        gender: true,
        full_name: true,
        phone_number: true,
        created_at: true
      })
    },
    handler: async (req, res) => {
      const decoded = jwt.verify(req.body.token, Config.JWT_REFRESH_SECRET) as { id: number, role: string };
      const user = await SQL_GET_USER({ id: decoded.id }).one(
        new HttpError(404)
      );
      res
        .setHeader('Authorization', generateToken(user.id, '1h', user.role, false))
        .json(user);
    }
  });
};

export default getRefreshToken;