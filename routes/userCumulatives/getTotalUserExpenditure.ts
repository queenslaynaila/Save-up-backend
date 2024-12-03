import { sql } from '../../db';
import HttpError from '../../httpError';
import Router from '../../router';
import {
  TotalExpenseInterface,
  totalExpenseResultSchema,
  totalExpensesQuerySchema,
  UserCumulaInterface
} from './types';

const SQL_GET_TOTAL_EXPENSES = sql<UserCumulaInterface, TotalExpenseInterface>(`
  SELECT COALESCE(SUM(amount), 0) AS total_expenses
  FROM expenses
  WHERE entity_id = :user_id
`);

const getTotalUserExpenditure = (router: Router) => {
  router.route({
    method: 'get',
    path: '/total-expenses',
    summary: 'Get total user expenditure',
    schema: {
      query: totalExpensesQuerySchema
    },
    response: {
      schema: totalExpenseResultSchema
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const user_id = req.user!.id;
      const { start_date, end_date, category_id } = req.query;
      const filters: string[] = [];
      const filterArgs: Record<string, string> = {};
      if (start_date) {
        filterArgs.start_date = Array.isArray(start_date)
          ? start_date[0] as string
          : start_date as string;
        filters.push('spent_at >= :start_date');
      }
      if (end_date) {
        filterArgs.end_date = Array.isArray(end_date)
          ? end_date[0] as string
          : end_date as string;
        filters.push('spent_at <= :end_date');
      }
      if (category_id) {
        filterArgs.category_id = Array.isArray(category_id)
          ? category_id[0] as string
          : category_id as string;
        filters.push('category_id = :categoryId');
      }
      const query = SQL_GET_TOTAL_EXPENSES({ user_id });
      if (filters.length > 0) query.extend(`AND ${filters.join(' AND ')}`, filterArgs);
      res.json(await query.one(new HttpError(500)));
    }
  });
};

export default getTotalUserExpenditure;