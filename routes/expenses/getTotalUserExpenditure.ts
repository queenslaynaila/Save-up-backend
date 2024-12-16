import { z } from 'zod';
import { sql } from '../../db';
import Router from '../../router';
import { ParsedQs } from 'qs';

const SQL_GET_TOTAL_EXPENSES = sql<{entity_id: number}, {total_expenses: number}>(`
  SELECT COALESCE(SUM(amount), 0) AS total_expenses
  FROM expenses
  WHERE entity_id = :entity_id
`);

const getTotalUserExpenditure = (router: Router) => {
  router.route({
    method: 'get',
    path: '/total-expenses',
    summary: 'Get total user expenditure',
    request: {
      body: z.object({
        entity_id: z.number().int().optional()
      }),
      query: z.object({
        start_date: z.string(),
        end_date: z.string(),
        category_id: z.string(),
        spent_from: z.string(),
        spent_to: z.string()
      }).partial()
    },
    response: {
      200: {
        schema: z.object({ total_expenses: z.number() })
      }
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const entity_id = req.body?.entity_id ?? req.user!.id;
      const { start_date, end_date, category_id, spent_from, spent_to } = req.query;

      const filters: string[] = [];
      const filterArgs: string | string [] | ParsedQs | ParsedQs[] = {};

      if (category_id) {
        filterArgs.category_id = category_id;
        filters.push('category_id = :category_id');
      }

      if (spent_from && spent_to) {
        filterArgs.spent_from = spent_from;
        filterArgs.spent_to = spent_to;
        filters.push('spent_at BETWEEN :spent_from AND :spent_to');
      } else {
        if (spent_from) {
          filterArgs.spent_from = spent_from;
          filters.push('spent_at >= :spent_from');
        }
        if (spent_to) {
          filterArgs.spent_to = spent_to;
          filters.push('spent_at <= :spent_to');
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

      const query = SQL_GET_TOTAL_EXPENSES({ entity_id });
      if (filters.length > 0) query.extend(`AND ${filters.join(' AND ')}`, filterArgs);

      const { total_expenses } = await query.one();
      res.json({ total_expenses });
    }
  });
};

export default getTotalUserExpenditure;