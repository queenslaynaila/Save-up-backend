import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';

const SQL_GET_TOTAL_EXPENSES = sql<{ userId: string }, { total_expenses: number }>(`
      SELECT COALESCE(SUM(amount), 0) AS total_expenses
      FROM expenses
      WHERE user_id = :userId`);

export default (router: Router) => {
  router.get<Record<string, never>, { total_expenses: number }, Record<string, never>,{startDate?:string;endDate?:string}>(
    '/total-expenses', 
    authMiddleware(), 
    async (req, res) => {
      const userId = req.user!.id;
      const { startDate, endDate } = req.query;
      console.log(req.query)
      const filters: string[] = [];
      const filterArgs: Record<string, string> = {};
      if (startDate) {
        filterArgs.startDate = startDate;
        filters.push(`date >= :startDate`);
      }
      if (endDate) {
        filterArgs.endDate = endDate;
        filters.push(`date <= :endDate`);
      }
      const query = SQL_GET_TOTAL_EXPENSES({userId });
      if (filters.length > 0) query.extend(`AND ${filters.join(' AND ')}`, filterArgs);
      console.log(query)
      query.extend('LIMIT 15', {});
      res.json(await query.one());

    });
};
