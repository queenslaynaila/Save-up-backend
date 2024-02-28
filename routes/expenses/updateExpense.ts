import { Router } from 'express';
import { z } from 'zod';
import { HttpError } from '../../middleware/errorMiddleware';
import { idSchema, updateExpenseSchema, ExtendedExpenseInterface } from '../../types';
import authMiddleware from '../../middleware/auth';
import { sql } from '../../db';

let updateExpenseQuery = 'UPDATE expenses SET ';
const SQL_UPDATE_EXPENSE = sql<
  z.infer<typeof updateExpenseSchema> & { id: string },
  ExtendedExpenseInterface
>(updateExpenseQuery);

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

    const values = [];

    if (description) {
      updateExpenseQuery += `description = :description, `;
      values.push(description);
    }
    if (category_id) {
      updateExpenseQuery += `category_id = :category_id, `;
      values.push(category_id);
    }
    if (amount) {
      updateExpenseQuery += `amount = :amount, `;
      values.push(amount);
    }
    if (date) {
      updateExpenseQuery += `date = :date, `;
      values.push(date);
    }

    updateExpenseQuery = updateExpenseQuery.slice(0, -2);
    updateExpenseQuery += ' WHERE id = :id RETURNING *';
    values.push(expenseId);

    const result = await SQL_UPDATE_EXPENSE({
      description,
      category_id,
      amount,
      date,
      id: expenseId,
    }).one(new HttpError(400, 'Expense with given ID not found'));

    res.status(200).json(result);
  });
};
