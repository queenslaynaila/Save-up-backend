import Router from '../../router';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { convertToTitleCase } from '../../middleware/caseNormalization';
import { BasePocketType, PocketQueryParamsSchema } from './types';
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

const getPocketByCriteria = (router: Router) => {
  router.route({
    method: 'get',
    path: '/',
    summary: 'Get list of pockets',
    schema: {
      body: entitySchema,
      query: PocketQueryParamsSchema
    },
    response: {
      schema: PocketQueryParamsSchema
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      const entity_id = req.body.entity_id ?? req.user!.id;
      const { xid, category_id, priority, status, start_date, end_date, is_default } = req.query;

      const filters: string[] = [];
      const filterArgs: Record<string, string> = {};

      if (is_default) {
        filterArgs.xid = '1';
        filters.push('xid = :xid');
      }
      if (category_id) {
        filterArgs.category_id = Array.isArray(category_id)
          ? String(category_id[0])
          : String(category_id);
        filters.push('category_id = :category_id');
      }
      if (xid) {
        filterArgs.xid = Array.isArray(xid) ? String(xid[0]) : String(xid);
        filters.push('xid = :xid');
      }
      if (start_date && end_date) {
        filterArgs.start_date = Array.isArray(start_date)
          ? String(start_date[0])
          : String(start_date);
        filterArgs.end_date = Array.isArray(end_date) ? String(end_date[0]) : String(end_date);
        filters.push('DATE(completed_at) BETWEEN :start_date AND :end_date');
      } else {
        if (start_date) {
          filterArgs.start_date = Array.isArray(start_date)
            ? String(start_date[0])
            : String(start_date);
          filters.push('DATE(created_at) >= :start_date');
        }
        if (end_date) {
          filterArgs.end_date = Array.isArray(end_date) ? String(end_date[0]) : String(end_date);
          filters.push('DATE(created_at)<= :end_date');
        }
      }

      if (priority) {
        const priorityStr = Array.isArray(priority) ? priority[0] as string : priority as string;
        filterArgs.priority = convertToTitleCase(priorityStr);
        filters.push('priority = :priority');
      }

      if (status) {
        const statusStr = Array.isArray(status) ? status[0] as string : status as string;
        filterArgs.status = convertToTitleCase(statusStr);
        filters.push('status = :status');
      }

      const query = SQL_GET_POCKETS({ entity_id });
      if (filters.length > 0) query.extend(`AND ${filters.join(' AND ')}`, filterArgs);
      query.extend('LIMIT 15', {});
      res.json(await query.many());
    }
  });
};

export default getPocketByCriteria;