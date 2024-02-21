import { Router } from 'express';
import authMiddleware from '../../middleware/auth';
import { UserRole } from '../../types';
import pool from '../../db';

export default (router: Router) => {
  router.get(
    '/',
    authMiddleware(),
    async (req, res) => {
      const userId = req.query.user_id;
      const query = 'SELECT * FROM categories WHERE user_id = $1 LIMIT 15';
      const result = await pool.query(query, [userId]);
      const categories = result.rows || [];
      return res.json(categories);
    }
  );
};
