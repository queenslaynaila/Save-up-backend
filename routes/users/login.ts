import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcrypt';
import { HttpError } from '../../middleware/errorMiddleware';
import { generateToken } from '../../middleware/generatetoken';
import { sql } from '../../db';
import { UserLoginSchema } from '../../types';
import { UserSchema } from './index';
import  { validateRequest } from '../../middleware/validationMiddleware';

interface ExtendedUserSchema extends UserSchema {
  password: string;
}

const SQL_GET_USER_PHONE = sql<{ phone_number: string }, { id: number }>(`
  SELECT id
  FROM users_phone
  WHERE phone_number = :phone_number
`);

const SQL_GET_USER = sql<{ id: number }, ExtendedUserSchema>(`
  SELECT *
  FROM users
  WHERE id = :id
`);


export default (fastify: FastifyInstance) => {
  fastify.post<{ Body: { phone_number: string;password:string } }>(
    '/signin',
    { preHandler:[validateRequest(UserLoginSchema)]},
    async (req:FastifyRequest<{ Body: { phone_number: string;password:string } }>, res:FastifyReply) => {
      const { password, phone_number } = req.body;
      const user = await SQL_GET_USER_PHONE({ phone_number }).one(
        new HttpError(404, 'Not found')
      );
      const userResult = await SQL_GET_USER({ id: user.id }).one();
      const isPasswordCorrect = await bcrypt.compare(password, userResult.password);
      if (!isPasswordCorrect) {
        throw new HttpError(400, 'Invalid phone number or password combination');
      }
      const userDataToSend = {
        id: userResult.id,
        first_name: userResult.first_name,
        last_name: userResult.last_name,
        phone_number: userResult.phone_number,
        role: userResult.role,
        created_at: userResult.created_at,
        updated_at: userResult.updated_at,
      };

      const accessToken = generateToken(userResult.id, userResult.role, '1d');
      const refreshToken = generateToken(userResult.id, userResult.role, '7d');
      res
        .header('X-Refresh-Token', refreshToken)
        .header('X-Auth-Token', accessToken)
        .send(userDataToSend);
    }
  );
};
