import Router from '../../router';
import { sql } from '../../db';
import { ParsedQs } from 'qs';
import authMiddleware from '../../middleware/authorization';
import { basePocketSchema, BasePocketType, PocketQueryParamsSchema } from './types';
import { entitySchema } from '../../globalTypes';
import { z } from 'zod';

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

const pocketSchema = basePocketSchema.omit({
  category_id: true,
  completed_at: true
}).extend({
  category_name: z.string()
});

const getPocketByCriteria = (router: Router) => {
  router.route({
    method: 'get',
    path: '/',
    summary: 'Get list of pockets',
    security: [{ 'authorization-token': [] }],
    schema: {
      body: entitySchema,
      query: PocketQueryParamsSchema
    },
    response: {
      schema: z.array(pocketSchema)
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      const entity_id = req.body.entity_id ?? req.user!.id;
      const { xid, category_id, priority, status, start_date, end_date } = req.query;

      const filters: string[] = [];
      const filterArgs: string | string [] | ParsedQs | ParsedQs[] = {};

      if (category_id) {
        filterArgs.category_id = category_id;
        filters.push('category_id = :category_id');
      }

      if (priority) {
        filterArgs.priority = priority;
        filters.push('priority = :priority');
      }

      if (status) {
        filterArgs.status = status;
        filters.push('status = :status');
      }

      if (xid) {
        filterArgs.xid = xid;
        filters.push('xid = :xid');
      }

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

      const query = SQL_GET_POCKETS({ entity_id });
      if (filters.length > 0) query.extend(`AND ${filters.join(' AND ')}`, filterArgs);
      query.extend('LIMIT 15', {});
      res.json(await query.many());
    }
  });
};

export default getPocketByCriteria;