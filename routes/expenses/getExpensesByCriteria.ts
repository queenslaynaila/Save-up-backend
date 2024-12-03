import Router from '../../router';
import { sql } from '../../db';
import authMiddleware from '../../authorization';
import {
  Expense,
  ExpenseSchema,
  expenseQuerySchema
} from './types';
import { entitySchema } from '../../globalTypes';
import { z } from 'zod';
import { ParsedQs } from 'qs';

const SQL_GET_EXPENSES = sql<{ entity_id:number }, Expense>(`
  SELECT entity_id, 
         xid, 
         category_id, 
         description, 
         amount, 
         spent_at, 
         created_at
  FROM expenses 
  WHERE deleted_at IS NULL
  AND entity_id = :entity_id
  AND deleted_at IS NULL
`);

export const getExpensesByCriteria = (router: Router) => {
  router.route({
    method: 'get',
    path: '/',
    summary: 'Get list of expenses by criteria',
    schema: {
      query: expenseQuerySchema,
      body: entitySchema
    },
    response: {
      schema: z.array(ExpenseSchema)
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      const entity_id = req.body?.entity_id ?? req.user!.id;
      const { category_id, start_date, end_date } = req.query;

      const filters: string[] = [];
      const filterArgs: string | string [] | ParsedQs | ParsedQs[] = {};

      if (category_id) {
        filterArgs.category_id = category_id;
        filters.push('category_id = :category_id');
      }
      if (start_date && end_date) {
        filterArgs.start_date = start_date;
        filterArgs.end_date = end_date;
        filters.push('DATE(created_at) BETWEEN :start_date AND :end_date');
      } else {
        if (start_date) {
          filterArgs.start_date = start_date;
          filters.push('DATE(created_at) >= :start_date');
        }
        if (end_date) {
          filterArgs.end_date = end_date;
          filters.push('DATE(created_at) <= :end_date');
        }
      }

      const query = SQL_GET_EXPENSES({ entity_id });
      if (filters.length > 0) query.extend(`AND ${filters.join(' AND ')}`, filterArgs);
      query.extend('LIMIT 15', {});
      const expenses = await query.many();
      res.json(expenses);
    }
  });
};

export default getExpensesByCriteria;