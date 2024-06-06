import {Response, Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { SavingInterface, SavingParamInterface, SavingsQueryInterface } from './types';
 
const SQL_GET_SAVINGS = sql<{entity_id: number}, SavingInterface>(`
  SELECT * FROM savings
  WHERE entity_id = :entity_id
`);

export default (router: Router) => {
  router.get<string, SavingParamInterface, SavingInterface[], Record<string,never>, SavingsQueryInterface>(
    '/', 
    authMiddleware(), 
    async (req, res: Response) => {
      const entity_id = req.body.entity_id ?? req.user!.id; // either grp or user
      const { pocket_id, start_date, end_date } = req.query;

      const filterArgs: Record<string, string> = {};
      const filters: string[] = [];
      
      if (pocket_id) {
        filterArgs.pocket_id = pocket_id.toString();
        filters.push(`pocket_id = :pocket_id`);
      }
      if (start_date && end_date) {
        filterArgs.start_date = start_date;
        filterArgs.end_date = end_date;
        filters.push(`DATE(created_at) BETWEEN :start_date AND :end_date`);
      } else {
        if (start_date) {
          filterArgs.start_date = start_date;
          filters.push(`DATE(created_at) >= :start_date`);
        }
        if (end_date) {
          filterArgs.end_date = end_date;
          filters.push(`DATE(created_at)<= :end_date`);
        }
      }
     
      const query = SQL_GET_SAVINGS({ entity_id });
      if (filters.length > 0) query.extend(`AND ${filters.join(' AND ')}`, filterArgs);
      query.extend('LIMIT 15', {});
      const savings = await query.many();
      res.json(savings)
    });
};
