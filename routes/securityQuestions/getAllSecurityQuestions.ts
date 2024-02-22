import { Router } from 'express';
import authMiddleware from '../../middleware/auth';
import { UserRole } from '../../types';
import pool from '../../db';

export default (router: Router) => {
  router.get('/', authMiddleware({ roles: [UserRole.ADMIN, UserRole.USER] }), async (_, res) => {
    const query = 'SELECT * FROM security_questions LIMIT 10';
    const result = await pool.query(query);
    const questions = result.rows || [];
    res.json(questions);
  });
};
