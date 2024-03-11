import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';
import { HttpError } from '../../middleware/errorMiddleware';

const CALCULATE_TOTAL_SAVINGS_BY_CUSTOM_TIME = sql<
{ userId: string; startDate: string; endDate: string },{ totalTargetAmount: number }>(`
    SELECT COALESCE(SUM(target_amount), 0) AS totalTargetAmount
    FROM savings 
    WHERE user_id = :userId
    AND start_date >= :startDate
    AND start_date <= :endDate
`);

export default (router: Router) => {
  router.get<Record<string, never>,{ totalTargetAmount: number }, Record<string, never>, { startDate: string; endDate: string }>(
    '/total-savings-by-time', 
    authMiddleware(), 
    async (req, res) => {
      const userId = req.user!.id;
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        throw new HttpError(400, 'Both start date and end date are required.');
      }
      const result = await CALCULATE_TOTAL_SAVINGS_BY_CUSTOM_TIME({
        userId,
        startDate,
        endDate,
      }).one()
      res.json(result);
    });
};
