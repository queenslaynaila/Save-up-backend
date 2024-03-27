import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { HttpError } from '../../middleware/errorMiddleware';
import { updateExpenseSchema, ExtendedExpenseInterface } from '../../types';
import authMiddleware from '../../middleware/auth';
import { sql } from '../../db';
import  { validateRequest } from '../../middleware/validationMiddleware';


const SQL_UPDATE_EXPENSE= sql<z.infer<typeof updateExpenseSchema> & { id:number;user_id:number;},ExtendedExpenseInterface>(`
  UPDATE expenses
  SET description = COALESCE(:description, expenses.description),
      category_id = COALESCE(:category_id, expenses.category_id),
      amount = COALESCE(:amount, expenses.amount),
      expense_date = COALESCE(:expense_spent_at, expenses.expense_spent_at)
  WHERE user_id = :user_id AND id = :id
  RETURNING *
`);

export default async (fastify: FastifyInstance) => {
  fastify.patch<{ Params: { id: string }; Body: z.infer<typeof updateExpenseSchema> }>(
    '/:id',
    { preHandler: [authMiddleware(), validateRequest(updateExpenseSchema)] },
    async (request: FastifyRequest<{ Params: { id: string };Body:z.infer<typeof updateExpenseSchema> }>, reply: FastifyReply) => {
      const userId = request.user!.id;
      const expenseId = parseInt(request.params.id);
      const { description, category_id, amount, expense_date } = request.body;
      const result = await SQL_UPDATE_EXPENSE({
        user_id: userId,
        id: expenseId,
        description: description,
        category_id: category_id,
        amount: amount,
        expense_date: expense_date,
      }).one(new HttpError(404, 'Not found'));
      reply.send(result);
    }
  );
};