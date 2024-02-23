import { Router } from 'express';
import authMiddleware from '../../middleware/auth';
import { UserRole } from '../../types';
import pool from '../../db';

export default (router: Router) => {
  router.get(
    '/',
    authMiddleware({ roles: [UserRole.ADMIN, UserRole.MODERATOR] }),
    async (req, res) => {
      const page = parseInt(String(req.query.page || '1'));
      const pageSize = parseInt(String(req.query.pageSize || '10'));
      const offset = (page - 1) * pageSize;
      const query = 'SELECT * FROM users ORDER BY created_at DESC OFFSET $1 LIMIT $2';
      const values = [offset, pageSize];
      const result = await pool.query(query, values);
      const users = result.rows || [];
      res.json(users);
    }
  );
};
