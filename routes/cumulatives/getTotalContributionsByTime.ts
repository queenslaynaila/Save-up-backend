import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';
import { HttpError } from '../../middleware/errorMiddleware';

const calculateTotalContributionsByCustomTimeframe = sql<{ userId: string, startDate: string, endDate: string }, { totalContributionAmount: number }>(`
    SELECT COALESCE(SUM(c.amount), 0) AS totalContributionAmount
    FROM contributions c
    JOIN savings s ON c.saving_id = s.id
    WHERE s.user_id = :userId
    AND c.date >= :startDate
    AND c.date <= :endDate
`);

export default (router: Router) => {
  router.get('/total-contributions-by-time', authMiddleware(), async (req, res) => {
    const userId = req.user!.id;
    let { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      throw new HttpError(400, 'Both start date and end date are required.');
    }

    startDate = new Date(startDate as string).toISOString(); 
    endDate = new Date(endDate as string).toISOString(); 
    const result = await calculateTotalContributionsByCustomTimeframe ({ userId, startDate, endDate }).one();
    res.json(result);
  });
};
