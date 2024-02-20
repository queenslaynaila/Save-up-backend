import authMiddleware from '../../middleware/auth';
import { UserRole } from '../../types';
import { Router } from 'express';
import pool from '../../db';

export default (router: Router) => {
  router.get('/', authMiddleware({ roles: [UserRole.ADMIN, UserRole.USER] }), async (req, res) => {
    const query = 'SELECT * FROM expenses';
    const result = await pool.query(query);
    const expenses = result.rows || [];
    return res.status(200).json(expenses);
  });
};
