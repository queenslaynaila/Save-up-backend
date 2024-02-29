import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';

const calculateTotalExpensesByCategory = sql<{ userId: string, categoryId: string }, { totalExpensesByCategory: number }>(`
    SELECT COALESCE(SUM(amount), 0) AS totalExpenses
    FROM expenses
    WHERE user_id = :userId
    AND category_id = :categoryId`);

export default (router: Router) => {
  router.get('/total-expenses-by-category/:categoryId', authMiddleware(), async (req, res) => {
    const userId = req.user!.id;
    const categoryId = req.params.categoryId;
    const result = await calculateTotalExpensesByCategory({ userId, categoryId }).one();
    const totalExpenses = result.totalExpensesByCategory;
    res.json({ totalExpenses: totalExpenses });
  });
};
