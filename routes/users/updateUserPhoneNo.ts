import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcrypt';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/auth';
import { hasPermission } from '../../middleware/hasPermission';
import { sql } from '../../db';
import { UpdatePhoneSchema } from '../../types';
import  { validateRequest } from '../../middleware/validationMiddleware';

const SQL_GET_USER_PASSWORD = sql<{ userId: string }, { password: string }>(
  `SELECT password FROM users WHERE id = :userId`
);
const SQL_UPDATE_PHONE = sql<{ phone_number: string; userId: string }, { phone_number: string }>(
  `UPDATE users_phone 
   SET phone_number = :phone_number 
   WHERE id = :userId
   RETURNING phone_number`
);

export default (fastify: FastifyInstance) => {
  fastify.patch<{ Params: { id: string }; Body: { phone_number: string;password:string } }>(
    '/update-phone/:id',
    { preHandler:[authMiddleware(),validateRequest(UpdatePhoneSchema)]},
    async (request: FastifyRequest<{ Params: { id: string }; Body: { phone_number: string ;password:string} }>, reply: FastifyReply) => {
      const userId = request.params.id;
      if (!hasPermission(request, parseInt(userId))) {
        throw new HttpError(403, 'Forbidden');
      }
      const { password, phone_number } =request.body;
      const userPassword = await SQL_GET_USER_PASSWORD({ userId }).one(
        new HttpError(404, 'Not found')
      );
      if (!await bcrypt.compare(password, userPassword.password)) {
        throw new HttpError(401, 'Invalid password');
      }
      const updateResult = await SQL_UPDATE_PHONE({ phone_number, userId }).one();
      reply.send(updateResult);
    });
};
