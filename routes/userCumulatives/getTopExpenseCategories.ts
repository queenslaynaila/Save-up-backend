import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { TopExpenseCategoriesInterface, UserCumulaInterface } from './types';

const SQL_GET_TOP_EXPENDITURE_CATEGORIES = sql<
UserCumulaInterface, TopExpenseCategoriesInterface
>(`
  SELECT 
    e.category_id, 
    c.name AS category_name, 
    COALESCE(SUM(e.amount_spent), 0) AS total_expense 
  FROM expenses e
  JOIN categories c ON e.category_id = c.id
  WHERE  e.entity_id = :user_id
  GROUP BY e.category_id, c.name
  ORDER BY total_expense DESC
`);

export default (router: Router) => {
  router.get<Record<string, never>, TopExpenseCategoriesInterface[],
  Record<string, never>, Record<string, never>>(
    '/top-expenditure-categories',
    authMiddleware(),
    async (req, res) => {
      const user_id = req.user!.id;
      const result = await SQL_GET_TOP_EXPENDITURE_CATEGORIES({ user_id }).many();
      res.json(result);
    }
  );
};