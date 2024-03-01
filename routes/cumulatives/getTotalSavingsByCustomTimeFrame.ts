import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';
import { HttpError } from '../../middleware/errorMiddleware';

const calculateTotalSavingsByCustomTimeframe = sql<{ userId: string, startDate: string, endDate: string }, { totalTargetAmount: number }>(`
    SELECT COALESCE(SUM(target_amount), 0) AS totalTargetAmount
    FROM savings 
    WHERE user_id = :userId
    AND start_date >= :startDate
    AND start_date <= :endDate
`);

export default (router: Router) => {
  router.get('/total-savings-by-time', authMiddleware(), async (req, res) => {
    const userId = req.user!.id;
    let { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      throw new HttpError(400, 'Both start date and end date are required.');
    }

    startDate = new Date(startDate as string).toISOString(); 
    endDate = new Date(endDate as string).toISOString(); 
    const result = await calculateTotalSavingsByCustomTimeframe ({ userId, startDate, endDate }).one();
    
    res.json(result);
  });
};
