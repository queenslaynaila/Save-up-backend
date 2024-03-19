import authMiddleware from '../../middleware/auth';
import { z } from 'zod';
import { Router } from 'express';
import { expenseSchema, ExtendedExpenseInterface } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';

const SQL_CREATE_EXPENSES = sql<z.infer<typeof expenseSchema>, ExtendedExpenseInterface>(`
  INSERT INTO expenses (description, category_id, amount,expense_date, user_id)
  VALUES (:description, :category_id, :amount, :expense_date, :user_id)
  RETURNING *
`);

export default (router: Router) => {
  router.post<Record<string, never>,ExtendedExpenseInterface,typeof expenseSchema,Record<string, never>,Record<string, never> >(
    '/', 
    authMiddleware(), 
    async (req, res) => {
      const validationResult = expenseSchema.safeParse(req.body);
      if (!validationResult.success) {
        console.error('Validation errors:', validationResult.error);
        throw new HttpError(400, 'Invalid expense data provided');
      }
      const { description, category_id, amount, expense_date, user_id } = validationResult.data;
      const loggedInUserId = req.user!.id;
      const authenticatedUserId = req.user?.id;
      if (authenticatedUserId !== user_id) {
        throw new HttpError(403, 'Unauthorized');
      }
      const expense = await SQL_CREATE_EXPENSES({
        description,
        category_id,
        amount,
        expense_date,
        user_id: loggedInUserId,
      })
        .one(new HttpError(400, 'Selected category does not exist'))
      return res.json(expense);
    });
};
