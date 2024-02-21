import authMiddleware from '../../middleware/auth';
import { UserRole } from '../../types';
import { Router } from 'express';
import pool from '../../db';

export default (router: Router) => {
  router.get(
    '/all',
    authMiddleware({ roles: [UserRole.ADMIN, UserRole.MODERATOR] }),
    async (req, res) => {
      const query = 'SELECT * FROM expenses LIMIT 10';
      const result = await pool.query(query);
      const expenses = result.rows || [];
      return res.json(expenses);
    }
  );
};
