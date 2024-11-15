import Router from '../../router';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { TopExpenseCategoriesInterface, topExpenseCategoriesSchema, UserCumulaInterface } from './types';
import { z } from 'zod';

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

const getTopExpenseCategories = (router: Router) => {
  router.route({
    method: 'get',
    path: '/top-expenditure-categories',
    summary: 'Get top expense categories',
    response: {
      schema: z.array(topExpenseCategoriesSchema)
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      const user_id = req.user!.id;
      const result = await SQL_GET_TOP_EXPENDITURE_CATEGORIES({ user_id }).many();
      res.json(result);
    }
  });
};

export default getTopExpenseCategories;