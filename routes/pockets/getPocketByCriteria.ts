import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import validateRequest from '../../middleware/validationMiddleware';
import { convertToTitleCase } from '../../middleware/caseNormalization';
import {
  BasePocketType,
  PocketQueryParamsType, 
  PocketByEntityType, 
  PocketQueryParamsSchema
} from './types';
import { entitySchema } from '../../globalTypes';

const SQL_GET_POCKETS = sql<{entity_id: number}, BasePocketType>(`
  SELECT pockets.xid, 
        pockets.name, 
        (
        SELECT categories.name FROM categories WHERE categories.id = pockets.category_id
        ) AS category_name, 
        pockets.target_amount, 
        pockets.priority, 
        pockets.status, 
        pockets.pocket_type, 
        pockets.target_at, 
        pockets.created_at
  FROM pockets
  WHERE pockets.deleted_at IS NULL
  AND pockets.entity_id = :entity_id
`);

export default (router: Router) => {
  router.get<string, Record<string, never>, BasePocketType[], PocketByEntityType , 
  PocketQueryParamsType>(
    '/', 
    validateRequest({ 
      body: entitySchema,  
      query: PocketQueryParamsSchema
    }),
    authMiddleware(), 
    async (req, res) => {
      const entity_id = req.body.entity_id ?? req.user!.id; 
      const { category_id, priority, status, start_date, end_date, is_default } = req.query;
      
      const filters: string[] = [];
      const filterArgs: Record<string, string> = {};

      if (is_default) {
        filterArgs.xid  = '1';
        filters.push(`xid = :xid`);
      }
      if (category_id) {
        filterArgs.category_id = category_id;
        filters.push(`category_id = :category_id`);
      }
      if (start_date && end_date) {
        filterArgs.start_date = start_date;
        filterArgs.end_date = end_date;
        filters.push(`DATE(completed_at) BETWEEN :start_date AND :end_date`);
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

      if (priority) {
        filterArgs.priority =  convertToTitleCase(priority)
        filters.push(`priority = :priority`);
      }

      if (status) {
        filterArgs.status =  convertToTitleCase(status)
        filters.push(`status = :status`);
      }

      const query = SQL_GET_POCKETS({ entity_id });
      if (filters.length > 0) query.extend(`AND ${filters.join(' AND ')}`, filterArgs);
      query.extend('LIMIT 15', {});
      res.json(await query.many());
    });
};