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
      let query = 'SELECT * FROM categories WHERE user_id = $1 OR user_id IS NULL LIMIT 15';
      let values = [userId];
      
      const result = await pool.query(query, values);
      const categories = result.rows || [];
      return res.json(categories);
    }
  );
};
