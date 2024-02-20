import authMiddleware from '../../middleware/auth';
import { UserRole } from '../../types';
import { Router } from 'express';
import pool from '../../db';

export default (router: Router) => {
  router.get('/', authMiddleware({ roles: [UserRole.ADMIN, UserRole.USER] }), async (req, res) => {
    const query = 'SELECT * FROM contributions';
    const result = await pool.query(query);
    const savings = result.rows || [];
    return res.status(200).json(savings);
  });
};
