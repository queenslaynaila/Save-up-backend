import authMiddleware from '../../middleware/auth';
import { UserRole } from '../../types';
import { Router } from 'express';
import pool from '../../db';

export default (router: Router) => {
  router.get(
    '/all',
    authMiddleware({ roles: [UserRole.ADMIN, UserRole.MODERATOR] }),
    async (req, res) => {
      const page = parseInt(String(req.query.page || '1'));
      const pageSize = parseInt(String(req.query.pageSize || '10'));
      const offset = (page - 1) * pageSize;
      const query = 'SELECT * FROM expenses ORDER BY created_at DESC OFFSET $1 LIMIT $2';
      const values = [offset, pageSize];
      const result = await pool.query(query,values);
      const expenses = result.rows || [];
      return res.json(expenses);
    }
  );
};
