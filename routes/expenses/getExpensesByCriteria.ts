import Router from '../../router';
import { sql } from '../../db';
import {
  Expense,
  expenseSchema
} from './schema';
import { z } from 'zod';
import { ParsedQs } from 'qs';
import verifyGroupMembership from '../../utils';

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

const getExpensesByCriteria = (router: Router) => {
  router.route({
    method: 'get',
    path: '/:entity_id',
    summary: 'Get list of expenses by criteria',
    request: {
      params: z.object({
        entity_id: z.union([
          z.string().regex(/^[1-9]\d*$/, "Must be a positive integer string"),
          z.literal("me"), 
        ]).default('me' )
      }),
      query: z.object({
        category_id: z.string().regex(/^\d+$/),
        spent_from: z.string().date(),
        spent_to: z.string().date(),
        start_date: z.string().date(),
        end_date: z.string().date()
      }).partial()
    },
    response: {
      200: {
        schema: z.array(expenseSchema)
      }
    },
    authMiddlewareOptions: {allowModeratorAccess: true},
    middlewares: [verifyGroupMembership(true)],
    handler: async (req, res) => {
      const entity_id = Number(req.params.entity_id);
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