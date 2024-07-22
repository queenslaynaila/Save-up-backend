import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import {
  BaseSavingType,
  savingsQueryParamSchema, 
  SavingsQueryParamType 
} from './types';
import validateRequest from '../../middleware/validationMiddleware';
import { EntityInterface, entitySchema } from '../../globalTypes';
 
const SQL_GET_SAVINGS = sql< {entity_id: number, type_id:number }, BaseSavingType>(`
  SELECT * FROM transactions
  WHERE type_id = :type_id
  AND entity_id = :entity_id
`);

export default (router: Router) => {
  router.get<string, Record<string,never>, BaseSavingType[], EntityInterface, 
  SavingsQueryParamType>(
    '/', 
    validateRequest({ 
      body: entitySchema,
      query:savingsQueryParamSchema
    }),
    authMiddleware(), 
    async (req, res) => {
      const entity_id = req.body?.entity_id ?? req.user!.id; // either grp or user
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
     
      const query = SQL_GET_SAVINGS({ entity_id, type_id:1 });
      if (filters.length > 0) query.extend(`AND ${filters.join(' AND ')}`, filterArgs);
      query.extend('LIMIT 15', {});
      const savings = await query.many();
      res.json(savings)
    });
};