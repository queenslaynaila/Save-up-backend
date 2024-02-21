import authMiddleware from '../../middleware/auth';
import { UserRole } from '../../types';
import { Router } from 'express';
import { expenseSchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import pool from '../../db';

export default (router: Router) => {
  router.post('/', authMiddleware({ roles: [UserRole.USER] }), async (req, res) => {
    const validationResult = expenseSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new HttpError(400, 'Invalid expense data provided');
    }
    const { description, category_id, amount, date, user_id } = validationResult.data;

    const query =
      'INSERT INTO expenses (description, category_id, amount, date, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    const values = [description, category_id, amount, date, user_id];
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      throw new HttpError(400, 'User with provided ID not found');
    }

    return res.json(result.rows[0]);
  });
};
