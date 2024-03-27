import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import authMiddleware from '../../middleware/auth';
import { HttpError } from '../../middleware/errorMiddleware';
import { UserRole, ID_SCHEMA,ExtendedExpenseInterface } from '../../types';
import { sql } from '../../db';
import  { validateRequest } from '../../middleware/validationMiddleware';

const SQL_GET_EXPENSE_BY_ID = sql<{ id:number; userId?:number }, ExtendedExpenseInterface>(`
  SELECT * FROM savings WHERE id = :id
`);

export default async (fastify: FastifyInstance) => {
  fastify.get<{ Params: { expenseId: string } }>(
    '/records/:expenseId',
    { preHandler: [authMiddleware(), validateRequest(ID_SCHEMA)] },
    async (request: FastifyRequest<{ Params: { expenseId: string } }>, reply: FastifyReply) => {
      const expenseId = parseInt(request.params.expenseId);
      const userId = request.user!.id;
      const userRole = request.user!.role;
      const query = SQL_GET_EXPENSE_BY_ID({ id: expenseId });
      if (userRole !== UserRole.ADMIN) {
        query.extend('AND user_id = :userId', { userId });
      }
      const result = await query.one(new HttpError(404, 'Not found'));
      return reply.send(result);
    }
  );
}
