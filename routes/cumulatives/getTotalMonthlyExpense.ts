import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';

const SQL_GET_TOTAL_MONTHLY_EXPENSES = sql<{ userId: string,month:number }, { totalMonthlyExpenses: number }>(`
    SELECT COALESCE(SUM(amount), 0) AS total_monthly_expenses
    FROM expenses
    WHERE user_id = :userId
    AND month = :month`);

export default (router: Router) => {
  router.get('/total-monthly-expenses/:month', authMiddleware(), async (req, res) => {
    const userId = req.user!.id;
    const month = req.params.month;
    const result = await SQL_GET_TOTAL_MONTHLY_EXPENSES({ userId, month }).one();
    const totalMonthlyExpenses = result.totalMonthlyExpenses;
    res.json({ totalMonthlyExpenses: totalMonthlyExpenses });
  });
};
