import { Router } from 'express';
import pool from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
import { UserRole } from '../../types';
import authMiddleware from '../../middleware/auth';

export default (router: Router) => {
  router.get(
    '/total-target-amount',
    authMiddleware({ roles: [UserRole.ADMIN, UserRole.USER] }),
    async (req, res) => {
      const userId = req.user?.id;
      const query = `
        SELECT COALESCE(SUM(target_amount), 0) AS total_target_amount
        FROM savings
        WHERE user_id = $1`;
      const result = await pool.query(query, [userId]);

      const totalTargetAmount = result.rows[0].total_target_amount;
      res.json({ total_target_amount: totalTargetAmount });
    }
  );
};
