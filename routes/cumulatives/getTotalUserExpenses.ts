import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';

const SQL_GET_TOTAL_EXPENSES = sql<{ userId: string }, { total_expenses: number }>(`
      SELECT COALESCE(SUM(amount), 0) AS total_expenses
      FROM expenses
      WHERE user_id = :userId`
);

export default (router: Router) => {
  router.get('/total-expenses', authMiddleware(), async (req, res) => {
    const userId = req.user!.id;
    const result = await SQL_GET_TOTAL_EXPENSES({ userId }).one();
    const totalExpenses = result.total_expenses;
    res.json({ total_expenses: totalExpenses });
  });
};
