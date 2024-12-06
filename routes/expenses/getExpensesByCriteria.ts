import Router from '../../router';
import { sql } from '../../db';
import {
  Expense,
  ExpenseSchema
} from './types';
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
      query: z.object({
        group_id: z.string(),
        category_id: z.string(),
        spent_from: z.string(),
        spent_to: z.string(),
        start_date: z.string(),
        end_date: z.string()
      }).partial()
    },
    response: {
      schema: z.array(ExpenseSchema)
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const entity_id = Number(req.query?.group_id) ?? req.user!.id;
      const { category_id, start_date, end_date, spent_from, spent_to } = req.query;

      const filters: string[] = [];
      const filterArgs: string | string [] | ParsedQs | ParsedQs[] = {};

      if (category_id) {
        filterArgs.category_id = category_id;
        filters.push('category_id = :category_id');
      }

      if (spent_from && spent_to) {
        filterArgs.spent_from = spent_from;
        filterArgs.spent_to = spent_to;
        filters.push('DATE(spent_at) BETWEEN :spent_from AND :spent_to');
      } else {
        if (spent_from) {
          filterArgs.spent_from = spent_from;
          filters.push('DATE(spent_at) >= :spent_from');
        }
        if (spent_to) {
          filterArgs.spent_to = spent_to;
          filters.push('DATE(spent_at) <= :spent_to');
        }
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