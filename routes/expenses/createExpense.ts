import authMiddleware from '../../middleware/auth';
import { z } from 'zod';
import { Router } from 'express';
import { expenseSchema, ExtendedExpenseInterface } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';

const SQL_CREATE_EXPENSES = sql<z.infer<typeof expenseSchema>, ExtendedExpenseInterface>(`
  INSERT INTO expenses (id,user_id,category_id,description, amount,expense_spent_at)
  SELECT COALESCE((SELECT MAX(id) FROM expenses WHERE user_id = :user_id), 0) + 1,
  :description, :category_id, :amount, :expense_date, :user_id)
  RETURNING user_id,id,category_id,description,amount,expense_spent_at,created_at
`);

export default (router: Router) => {
  router.post<Record<string, never>,ExtendedExpenseInterface,typeof expenseSchema,Record<string, never>,Record<string, never> >(
    '/', 
    authMiddleware(), 
    async (req, res) => {
      const validationResult = expenseSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw new HttpError(422, "Unprocessable Entity");
      }
      const { description, category_id, amount, expense_date, user_id } = validationResult.data;
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
      })
        .one()
      return res.json(expense);
    });
};
