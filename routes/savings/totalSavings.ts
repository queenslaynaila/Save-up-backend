import Router from '../../router';
import { sql } from '../../db';
import authMiddleware from '../../authorization';
import { Totals, totalSavings } from './types';
import { ParsedQs } from 'qs';
import { z } from 'zod';

const SQL_GET_TOTAL_SAVINGS = sql<{user_id:number, type_id:number}, Totals>(`
  SELECT 
    SELECT COALESCE(SUM(delta), 0) AS  total_savings
  FROM 
    transactions
  WHERE 
    entity_id = :user_id
    AND type_id = :type_id;
`);

const getotalSavings = (router: Router) => {
  router.route({
    method: 'get',
    path: '/totals',
    summary: 'Get total savings',
    schema: {
      query: z.object({
        start_date: z.string().optional(),
        end_date: z.string().optional()
      })
    },
    response: {
      schema: totalSavings
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      const filters: string[] = [];
      const filterArgs: string | string [] | ParsedQs | ParsedQs[] = {};

      const { start_date, end_date } = req.query;

      if (start_date && end_date) {
        filterArgs.start_date = start_date;
        filterArgs.end_date = end_date;
        filters.push('DATE(completed_at) BETWEEN :start_date AND :end_date');
      } else {
        if (start_date) {
          filterArgs.start_date = start_date;
          filters.push('DATE(created_at) >= :start_date');
        }
        if (end_date) {
          filterArgs.end_date = end_date;
          filters.push('DATE(created_at)<= :end_date');
        }
      }

      const query = SQL_GET_TOTAL_SAVINGS({
        user_id: req.user!.id,
        type_id: 1
      });

      if (filters.length > 0) query.extend(`AND ${filters.join(' AND ')}`, filterArgs);

      res.json(await query.one());
    }
  });
};

export default getotalSavings;