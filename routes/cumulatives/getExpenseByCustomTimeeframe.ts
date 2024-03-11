import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';
import { HttpError } from '../../middleware/errorMiddleware';

const SQL_CALCULATE_TOTAL_EXPENSE_BY_CUSTOME_TIME = sql<{ userId: string; startDate: string; endDate: string },{ totalExpense: number }>(`
    SELECT COALESCE(SUM(amount), 0) AS totalExpense
    FROM expenses
    WHERE user_id = :userId
    AND date >= :startDate
    AND date <= :endDate
`);

export default (router: Router) => {
  router.get<Record<string, never>, { totalExpense: number }, Record<string, never>, { startDate: string; endDate: string }>(
    '/total-expense-by-custom-timeframe', authMiddleware(), async (req, res) => {
      const userId = req.user!.id;
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        throw new HttpError(400, 'Both start date and end date are required.');
      }
      const result = await SQL_CALCULATE_TOTAL_EXPENSE_BY_CUSTOME_TIME({
        userId,
        startDate,
        endDate,
      }).one();
      res.json(result);
    });
};
