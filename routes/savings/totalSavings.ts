import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { QueryParams, Totals } from './types';
// All Savings made by user since he joined the app

const SQL_GET_TOTAL_SAVINGS = sql<{user_id:number, type_id:number}, Totals>(`
  SELECT 
    SUM(delta) AS total_savings
  FROM 
    transactions
  WHERE 
    entity_id = :user_id
    AND type_id = :type_id;
`);

export default (router: Router) => {
  router.get<Record<string, never>, Totals, Record<string, never>,
  QueryParams>(
    '/totals',
    authMiddleware(),
    async (req, res) => {
      const filters: string[] = [];
      const filterArgs: Record<string, string> = {};

      const { start_date, end_date } = req.query;

      if (start_date && end_date) {
        filterArgs.start_date = start_date;
        filterArgs.end_date = end_date;
        filters.push('DATE(created_at) BETWEEN :start_date AND :end_date');
      }

      const query = SQL_GET_TOTAL_SAVINGS({
        user_id: req.user!.id,
        type_id: 1
      });

      if (filters.length > 0) query.extend(`AND ${filters.join(' AND ')}`, filterArgs);

      res.json(await query.one());
    }
  );
};