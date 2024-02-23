import { Router } from 'express';
import pool from '../../db';
import authMiddleware from '../../middleware/auth';

export default (router: Router) => {
  router.get(
    '/total-target-amount',
    authMiddleware(),
    async (req, res) => {
      const userId = req.user?.id;
      const { priority, status, category_id } = req.query as { priority?: string, status?: string, category_id?: string };

      let condition = 'user_id = $1';
      const values = [userId];

      if (priority) {
        condition += ' AND priority = $2';
        values.push(priority);
      }

      if (status) {
        condition += ' AND status = $' + (values.length + 1);
        values.push(status);
      }

      if (category_id) {
        condition += ' AND category_id = $' + (values.length + 1);
        values.push(category_id);
      }

      const query = `
        SELECT COALESCE(SUM(target_amount), 0) AS total_target_amount
        FROM savings
        WHERE ${condition}`;

      const result = await pool.query(query, values);

      const totalTargetAmount = result.rows[0].total_target_amount;
      res.json({ total_target_amount: totalTargetAmount });
    }
  );
};
