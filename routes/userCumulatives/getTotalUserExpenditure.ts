import { z } from 'zod';
import { sql } from '../../db';
import Router from '../../router';
import { ParsedQs } from 'qs';
import {
  TotalExpenseInterface,
  totalExpensesQuerySchema,
  UserCumulaInterface
} from './types';
import logger from '../../logger';

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
      schema: z.object({ total_expenses: z.number() })
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const user_id = req.user!.id;
      const { start_date, end_date, category_id } = req.query;

      const filters: string[] = [];
      const filterArgs: string | string [] | ParsedQs | ParsedQs[] = {};

      if (start_date) {
        filterArgs.start_date = start_date;
        filters.push('DATE(spent_at) >= :start_date');
      }

      logger.info(`start date is ${start_date}`);

      if (end_date) {
        filterArgs.end_date = end_date;
        filters.push('DATE(spent_at) <= :end_date');
      }

      logger.info(`end date is ${end_date}`);

      if (category_id) {
        filterArgs.category_id = category_id;
        filters.push('category_id = :categoryId');
      }

      const query = SQL_GET_TOTAL_EXPENSES({ user_id });
      logger.info(`query constructed is ${query}`);
      if (filters.length > 0) query.extend(`AND ${filters.join(' AND ')}`, filterArgs);

      const { total_expenses } = await query.one();
      res.json({ total_expenses });
    }
  });
};

export default getTotalUserExpenditure;