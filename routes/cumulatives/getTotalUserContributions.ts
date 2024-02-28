import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';

const SQL_GET_TOTAL_CONTRIBUTIONS = sql<{ userId: string }, { total_contributed_amount: number }>(`
    SELECT COALESCE(SUM(c.amount), 0) AS total_contributed_amount
    FROM contributions c
    JOIN savings s ON c.saving_id = s.id
    WHERE s.user_id = :userId
`);

export default (router: Router) => {
  router.get('/total-contributions', authMiddleware(), async (req, res) => {
    const userId = req.user!.id;
    const result = await SQL_GET_TOTAL_CONTRIBUTIONS({ userId }).one();
    const totalContributedAmount = result.total_contributed_amount;
    res.json({ total_contributed_amount: totalContributedAmount });
  });
};
