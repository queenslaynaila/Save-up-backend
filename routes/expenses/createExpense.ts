import authMiddleware from '../../middleware/auth';
import { Router } from 'express';
import { expenseSchema,ExtendedExpenseInterface } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';

export default (router: Router) => {
  router.post('/', authMiddleware(), async (req, res) => {
    const validationResult = expenseSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new HttpError(400, 'Invalid expense data provided');
    }
    
    const { description, category_id, amount, date, user_id } = validationResult.data;
    const query = `
      INSERT INTO expenses (description, category_id, amount, date, user_id)
      VALUES (:description, :category_id, :amount, :date, :user_id)
      RETURNING id, created_at, updated_at, month
    `;

    const SQL_CREATE_EXPENSES = sql<typeof validationResult.data, ExtendedExpenseInterface>(query);
    const expense = await SQL_CREATE_EXPENSES({
      description,
      category_id,
      amount,
      date,
      user_id,
    }).one()
    
    return res.json(expense);
    
  });
};
