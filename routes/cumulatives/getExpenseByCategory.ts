import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';

const SQL_CALCULATE_TOTAL_EXPENSES_BY_CATEGORY = sql<{ userId: string; categoryId: string },{ totalExpensesByCategory: number }>(`
    SELECT COALESCE(SUM(amount), 0) AS totalExpenses
    FROM expenses
    WHERE user_id = :userId
    AND category_id = :categoryId
`);

export default (router: Router) => {
  router.get<{categoryId:string},{ totalExpensesByCategory: number },Record<string, never>, Record<string, never>>(
    '/total-expenses-by-category/:categoryId', 
    authMiddleware(), 
    async (req, res) => {
      const userId = req.user!.id;
      const categoryId = req.params.categoryId;
      const result = await SQL_CALCULATE_TOTAL_EXPENSES_BY_CATEGORY({ userId, categoryId }).one();
      const totalExpenses = result.totalExpensesByCategory;
      res.json({ totalExpensesByCategory: totalExpenses });
    });
};
