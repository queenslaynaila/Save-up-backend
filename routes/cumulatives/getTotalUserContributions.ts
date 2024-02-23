import { Router } from 'express';
import pool from '../../db';

import { UserRole } from '../../types';
import authMiddleware from '../../middleware/auth';

export default (router: Router) => {
  router.get(
    '/total-contributions',
    authMiddleware(),
    async (req, res) => {
      const userId = req.user?.id;

      const query = `
          SELECT COALESCE(SUM(c.amount), 0) AS total_contributed_amount
          FROM contributions c
          JOIN savings s ON c.saving_id = s.id
          WHERE s.user_id = $1`;
      const result = await pool.query(query, [userId]);

      const totalContributedAmount = result.rows[0].total_contributed_amount;
      res.json({ total_contributed_amount: totalContributedAmount });
    }
  );
};
