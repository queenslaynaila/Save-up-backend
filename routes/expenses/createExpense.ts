import { FastifyRequest, FastifyReply,FastifyInstance } from 'fastify';
import authMiddleware from '../../middleware/auth';
import { z } from 'zod';
import { expenseSchema, ExtendedExpenseInterface } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';
import  { validateRequest } from '../../middleware/validationMiddleware';

const SQL_CREATE_EXPENSES = sql<z.infer<typeof expenseSchema>, ExtendedExpenseInterface>(`
  INSERT INTO expenses (id,user_id,category_id,description, amount,expense_spent_at)
  SELECT COALESCE((SELECT MAX(id) FROM expenses WHERE user_id = :user_id), 0) + 1,
  :description, :category_id, :amount, :expense_date, :user_id)
  RETURNING user_id,id,category_id,description,amount,expense_spent_at,created_at
`);

export default async (fastify: FastifyInstance) => {
  fastify.post<{ Body:z.infer<typeof expenseSchema>  }>(
    '/',
    { preHandler:[ authMiddleware(),validateRequest(expenseSchema) ]}, 
    async (req: FastifyRequest<{ Body:z.infer<typeof expenseSchema>}>, reply: FastifyReply) => {
      const { description, category_id, amount, expense_date, user_id } = req.body;
      const loggedInUserId = req.user!.id;
      const authenticatedUserId = req.user?.id;
      if (authenticatedUserId !== user_id) {
        throw new HttpError(403, 'Forbidden');
      }
      const expense = await SQL_CREATE_EXPENSES({
        description,
        category_id,
        amount,
        expense_date,
        user_id: loggedInUserId,
      }).one()
      return reply.send(expense);
    }
  );
};