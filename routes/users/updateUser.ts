import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';
import { hasPermission } from '../../middleware/hasPermission';
import { UpdateUserSchema } from '../../types';
import { UserSchema } from './index';
import { HttpError } from '../../middleware/errorMiddleware';
import  { validateRequest } from '../../middleware/validationMiddleware';

interface UpdateUserSchema {
  first_name: string | undefined;
  last_name: string | undefined;
  id:number;
}

const SQL_UPDATE_USER = sql<UpdateUserSchema, UserSchema>(`
  UPDATE users
  SET first_name = COALESCE(:first_name, users.first_name),
      last_name = COALESCE(:last_name, users.last_name)
  WHERE id = :id
  RETURNING *
`);

export default (fastify: FastifyInstance) => {
  fastify.patch<{ Params: { id: string }, Body: UpdateUserSchema }>(
    '/:id', 
    { preHandler: [authMiddleware(), validateRequest(UpdateUserSchema)] },
    async (req: FastifyRequest<{ Params: { id: string }, Body: UpdateUserSchema }>, reply: FastifyReply) => {
      const userId = parseInt(req.params.id);
      if (!hasPermission(req, userId)) {
        throw new HttpError(403, 'Forbidden');
      }
      const { first_name, last_name } = req.body;
      const result = await SQL_UPDATE_USER({
        id: userId,
        first_name: first_name,
        last_name: last_name
      }).one();
      
      reply.send(result);
    });
};