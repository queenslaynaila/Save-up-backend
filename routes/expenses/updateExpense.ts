import { Router } from 'express';
import { z } from 'zod';
import { HttpError } from '../../middleware/errorMiddleware';
import { idSchema, updateExpenseSchema, ExtendedExpenseInterface } from '../../types';
import authMiddleware from '../../middleware/auth';
import { sql } from '../../db';

const SQL_UPDATE_EXPENSE = (updated: string) =>
  sql<z.infer<typeof updateExpenseSchema> & { id: string }, ExtendedExpenseInterface>(updated);

export default (router: Router) => {
  router.patch('/:id', authMiddleware(), async (req, res) => {
    const userId = req.user!.id;
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

    const values: z.infer<typeof updateExpenseSchema> & {
      user_id: string;
      expense_id: string;
      id: string;
    } = {
      user_id: userId,
      expense_id: expenseId,
      id: expenseId,
    };

    const query = 'UPDATE expenses SET ';
    let param = '';

    if (description) {
      param += `description = :description, `;
      values.description = description;
    }
    if (category_id) {
      param += `category_id = :category_id, `;
      values.category_id = category_id;
    }
    if (amount) {
      param += `amount = :amount, `;
      values.amount = amount;
    }
    if (date) {
      param += `date = :date, `;
      values.date = date;
    }

    param = param.slice(0, -2);

    const updated = `${query}${param} WHERE user_id = :user_id AND id = :expense_id RETURNING *`;

    const result = await SQL_UPDATE_EXPENSE(updated)(values).one(
      new HttpError(400, 'Expense with given ID not found')
    );

    res.status(200).json(result);
  });
};
