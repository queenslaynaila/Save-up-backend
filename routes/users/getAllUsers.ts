import { Router } from 'express';
import authMiddleware from '../../middleware/auth';
import { UserRole } from '../../types';
import pool from '../../db';

export default (router: Router) => {
  router.get('/', authMiddleware({ roles: [UserRole.ADMIN, UserRole.MODERATOR] }), async (_, res) => {
    const query = 'SELECT * FROM users LIMIT 10';
    const result = await pool.query(query);
    const users = result.rows || [];
    res.json(users);
  });
};
