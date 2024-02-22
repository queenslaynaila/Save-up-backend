import authMiddleware from '../../middleware/auth';
import { UserRole } from '../../types';
import { Router } from 'express';
import { HttpError } from '../../middleware/errorMiddleware';
import pool from '../../db';

export default (router: Router) => {
  router.get('/', authMiddleware({ roles: [UserRole.ADMIN, UserRole.USER] }), async (req, res) => {
    const { user_id, priority, status } = req.query;
    const logged_in_user_id = req.user?.id;
    let query = 'SELECT * FROM savings WHERE user_id = $1';
    const values = [user_id];
    let errorMessage = 'No savings found for the provided user ID';

    if (user_id !== logged_in_user_id) {
      throw new HttpError(403, 'Unauthorized access');
    }

    if (priority) {
      query += ' AND priority = $' + (values.length + 1);
      values.push(priority);
    }

    if (status) {
      query += ' AND status = $' + (values.length + 1);
      values.push(status);
    }

    errorMessage = 'No savings found for the given query';

    const result = await pool.query(query, values);
    const savings = result.rows || [];
    return res.json(savings)

  });
};
