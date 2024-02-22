import { Router } from 'express';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/auth';
import { UserRole } from '../../types';
import pool from '../../db';

export default (router: Router) => {
  router.get('/', authMiddleware(), async (req, res) => {
    const { user_id, category_id, month } = req.query;
    const logged_in_user_id = req.user?.id;
    let query = 'SELECT * FROM expenses WHERE user_id = $1';
    const values = [user_id];
    let errorMessage = 'No expenses found for the provided user ID';

    if (user_id !== logged_in_user_id) {
      throw new HttpError(403, 'Unauthorized access');
    }

    if (category_id) {
      query += ' AND category = $2';
      values.push(category_id);
    }

    if (month) {
      query += ' AND EXTRACT(MONTH FROM date) = $' + (values.length + 1);
      values.push(month);
    }

    errorMessage = 'No expenses found for the given query';

    const results = await pool.query(query, values);
    const expenses = results.rows || [];
    return res.json(expenses)
  });
};
