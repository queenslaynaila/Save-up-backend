import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { GetTotalDepositsInterface, GetUserCumulaInterface } from './types';

const SQL_GET_TOTAL_DEPOSITS = sql<GetUserCumulaInterface, GetTotalDepositsInterface>(`
  SELECT COALESCE(SUM(c.amount), 0) AS total_contributed_amount
  FROM deposits d
  JOIN pockets p ON d.pocket_id = p.id
  WHERE s.user_id = :userId
`);

export default (router: Router) => {
  router.get<Record<string,never>, GetTotalDepositsInterface, Record<string,never>, Record<string,never>>(
    '/total-deposits', 
    authMiddleware(), 
    async (req, res) => {
      const userId = req.user!.id;
      const { startDate, endDate } = req.query;
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

      const query = SQL_GET_TOTAL_DEPOSITS({userId });
      if (filters.length > 0) query.extend(`AND ${filters.join(' AND ')}`, filterArgs);
      query.extend('LIMIT 15', {});
      res.json(await query.one(new HttpError(500, 'Unable to complete the request')));
    });
};
