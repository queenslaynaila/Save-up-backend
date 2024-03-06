import { Router, Request, Response } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';

interface TopExpenditureCategory {
  total_expense: number;
}

const SQL_GET_TOP_EXPENDITURE_CATEGORIES = sql<{ userId: string }, TopExpenditureCategory>(`
    SELECT category_id, COALESCE(SUM(amount), 0) AS total_expense
    FROM expenses
    WHERE user_id = :userId
    GROUP BY category_id
    ORDER BY total_expense DESC
`);

export default (router: Router) => {
  router.get('/top-expenditure-categories', authMiddleware(), async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const result = await SQL_GET_TOP_EXPENDITURE_CATEGORIES({ userId }).many();
    res.json(result);
  });
};
