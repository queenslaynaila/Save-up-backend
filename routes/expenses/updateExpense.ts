import { Router } from 'express';
import { HttpError } from '../../middleware/errorMiddleware';
import { idSchema, updateExpenseSchema } from '../../types';
import authMiddleware from '../../middleware/auth';
import pool from '../../db';

export default (router: Router) => {
  router.patch('/:id', authMiddleware(), async (req, res) => {
    const validationResult = idSchema.safeParse(req.params.id);
    if (!validationResult.success) {
      throw new HttpError(422, 'Invalid expense ID');
    }
    const expenseId = validationResult.data;

    const validationResultBody = updateExpenseSchema.safeParse(req.body);
    if (!validationResultBody.success) {
      throw new HttpError(
        422,
        'Invalid expense data. Please provide valid values for all expense fields.'
      );
    }

    const { description, category_id, amount, date } = validationResultBody.data;
    let query = 'UPDATE expenses SET ';
    const values = [];

    if (description) {
      query += `description = $${values.length + 1}, `;
      values.push(description);
    }
    if (category_id) {
      query += `category_id = $${values.length + 1}, `;
      values.push(category_id);
    }
    if (amount) {
      query += `amount = $${values.length + 1}, `;
      values.push(amount);
    }
    if (date) {
      query += `date = $${values.length + 1}, `;
      values.push(date);
    }

    query = query.slice(0, -2);
    query += ` WHERE id = $${values.length + 1} RETURNING *`;
    values.push(expenseId);

    const result = await pool.query(query, values);
    const updatedExpense = result.rows[0];

    if (!updatedExpense) {
      throw new HttpError(400, 'Expense with given ID not found');
    }

    res.status(200).json(updatedExpense);
  });
};
