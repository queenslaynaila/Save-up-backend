import authMiddleware from '../../middleware/auth';
import { UserRole } from '../../types';
import { Router } from 'express';
import pool from '../../db';

export default (router: Router) => {
  router.get(
    '/',
    authMiddleware({ roles: [UserRole.ADMIN, UserRole.MODERATOR] }),
    async (req, res) => {
      const query = 'SELECT * FROM contributions LIMIT 10';
      const result = await pool.query(query);
      const contributions = result.rows || [];
      return res.json(contributions);
    }
  );
};
