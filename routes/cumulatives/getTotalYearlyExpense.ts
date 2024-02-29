import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';

const calculateTotalYearlyExpense = sql<{ userId: string }, { totalYearlyExpense: number }>(`
    SELECT COALESCE(SUM(amount), 0) AS totalYearlyExpense
    FROM expenses
    WHERE user_id = :userId
    AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)`);

export default (router: Router) => {
  router.get('/total-yearly-expense', authMiddleware(), async (req, res) => {
    const userId = req.user!.id;
    const result = await calculateTotalYearlyExpense({ userId }).one();
    const totalYearlyExpense = result.totalYearlyExpense;
    res.json({ totalYearlyExpense: totalYearlyExpense });
  });
};
