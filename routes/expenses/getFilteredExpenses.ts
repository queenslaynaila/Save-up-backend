import { Router } from 'express';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/auth';
import { UserRole } from '../../types';
import pool from '../../db';

export default (router: Router) => {
  router.get(
    '/:id',
    authMiddleware({ roles: [UserRole.ADMIN, UserRole.USER] }),
    async (req, res) => {
      const { user_id, category, month } = req.query;
      const logged_in_user_id = req.user?.id;
      let query = 'SELECT * FROM expenses WHERE user_id = $1';
      const values = [user_id];
      let errorMessage = 'No expenses found for the provided user ID';

      if (user_id !== logged_in_user_id) {
        throw new HttpError(403, 'Unauthorized access');
      }

      if (category) {
        query += ' AND category = $2';
        values.push(category);
      }

      if (month) {
        query += ' AND EXTRACT(MONTH FROM date) = $' + (values.length + 1);
        values.push(month);
      }

      errorMessage = 'No expenses found for the given query';

      const result = await pool.query(query, values);
      if (result.rows.length > 0) {
        res.status(200).json(result.rows);
      } else {
        return res.status(404).json({ error: new HttpError(404, errorMessage).message });
      }
    }
  );
};
