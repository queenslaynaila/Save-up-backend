import { Router, Request, Response } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { TopExpenseCategories } from '../../types/index'


const SQL_GET_TOP_EXPENDITURE_CATEGORIES = sql<{ userId:number }, TopExpenseCategories>(`
  SELECT e.category_id, c.name AS category_name, COALESCE(SUM(e.amount_spent), 0) AS total_expense FROM expenses e
  JOIN categories c ON e.category_id = c.id
  WHERE  e.entity_id = :userId
  GROUP BY e.category_id, c.name
  ORDER BY total_expense DESC
`);

export default (router: Router) => {
  router.get<Record<string, never>, TopExpenseCategories, Record<string, never>, Record<string, never>>(
    '/top-expenditure-categories',
    authMiddleware(),
    async (req: Request, res: Response) => {
      const userId = req.user!.id;
      const result = await SQL_GET_TOP_EXPENDITURE_CATEGORIES({ userId }).many();
      res.json(result);
    }
  );
};
