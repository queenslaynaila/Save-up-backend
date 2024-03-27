import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import  { validateRequest } from '../../middleware/validationMiddleware';
import { ID_SCHEMA } from '../../types';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth'; 

const SQL_DELETE_EXPENSE = sql<{ id: number; user_id: number }, Record<string, never>>(`
  UPDATE expenses
  SET deleted_at = NOW()
  WHERE id = :id
  AND user_id = :user_id
`);

export default async (fastify: FastifyInstance) => {
  fastify.delete<{ Params: { id: string } }, { message: string }>(
    '/:id',
    { preHandler:[ authMiddleware(),validateRequest(ID_SCHEMA) ]}, 
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const expenseId = parseInt(request.params.id);
      const userId = request.user!.id;
      await SQL_DELETE_EXPENSE({ id: expenseId, user_id: userId }).exec();
      reply.code(204).send();
    }
  );
};
