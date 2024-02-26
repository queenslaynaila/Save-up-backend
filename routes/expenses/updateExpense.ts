import { Router } from 'express';
import { HttpError } from '../../middleware/errorMiddleware';
import { idSchema, updateExpenseSchema } from '../../types';
import authMiddleware from '../../middleware/auth';
import { sql } from '../../db';

export default (router: Router) => {
  router.patch('/:id', authMiddleware(), async (req, res) => {
    const validationResult = idSchema.safeParse(req.params.id);
    if (!validationResult.success) {
      throw new HttpError(422, 'Invalid expense ID');
    }
    const expenseId = validationResult.data;

    const validationResultBody = updateExpenseSchema.safeParse(req.body);
    if (!validationResultBody.success) {
      throw new HttpError(422, validationResultBody.error.errors[0].message);
    }

    const { description, category_id, amount, date } = validationResultBody.data;

    let query = 'UPDATE expenses SET ';
    const values = [];

    if (description) {
      query += `description = :description, `;
      values.push(description);
    }
    if (category_id) {
      query += `category_id = :category_id, `;
      values.push(category_id);
    }
    if (amount) {
      query += `amount = :amount, `;
      values.push(amount);
    }
    if (date) {
      query += `date = :date, `;
      values.push(date);
    }

    query = query.slice(0, -2);
    query += ' WHERE id = :id RETURNING *';
    values.push(expenseId);

    const SQL_UPDATE_EXPENSE = sql<{ description?: string; category_id?: string; amount?: number; date?: string; id: string }, Record<string, never>>(query);
    const result = await SQL_UPDATE_EXPENSE({ description, category_id, amount, date, id: expenseId }).one();

    if (!result) {
      throw new HttpError(400, 'Expense with given ID not found');
    }

    res.status(200).json(result);
  });
};
