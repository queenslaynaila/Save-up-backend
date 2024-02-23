import authMiddleware from '../../middleware/auth';
import { Router } from 'express';
import pool from '../../db';
import { UserRole } from '../../types';

export default (router: Router) => {
  router.get(
    '/all',
    authMiddleware({ roles: [UserRole.ADMIN, UserRole.MODERATOR] }),
    async (_, res) => {
      const query = 'SELECT * FROM categories LIMIT 15';
      const result = await pool.query(query);
      const contributions = result.rows || [];
      return res.json(contributions);
    }
  );
};
