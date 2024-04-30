import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { GetTotalDepositsInterface, GetUserCumulaInterface } from './types';

const SQL_GET_TOTAL_DEPOSITS = sql<GetUserCumulaInterface, GetTotalDepositsInterface>(`
  SELECT COALESCE(SUM(c.amount), 0) AS total_contributed_amount
  FROM deposits d
  JOIN pockets p ON d.pocket_id = p.id
  WHERE s.user_id = :user_id
`);

export default (router: Router) => {
  router.get<Record<string,never>, GetTotalDepositsInterface, Record<string,never>, Record<string,never>>(
    '/total-deposits', 
    authMiddleware(), 
    async (req, res) => {
      const user_id = req.user!.id;
      const { start_date, end_date } = req.query;
      const filters: string[] = [];
      const filterArgs: Record<string, string> = {};

      if (start_date) {
        filterArgs.start_date = start_date;
        filters.push(`date >= :start_date`);
      }
      if (end_date) {
        filterArgs.end_date = end_date;
        filters.push(`date <= :end_date`);
      }

      const query = SQL_GET_TOTAL_DEPOSITS({user_id });
      if (filters.length > 0) query.extend(`AND ${filters.join(' AND ')}`, filterArgs);
      query.extend('LIMIT 15', {});
      res.json(await query.one(new HttpError(500, 'Unable to complete the request')));
    });
};
