import Router from '../../router';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { BaseSavingType, savingsQueryParamSchema } from './types';
const SQL_GET_SAVINGS = sql< {entity_id: number, type_id:number }, BaseSavingType>(`
  SELECT * FROM transactions
  WHERE type_id = :type_id
  AND entity_id = :entity_id
`);

const getSavingsByCriteria = (router: Router) => {
  router.route({
    method: 'get',
    path: '/',
    summary: 'Get list of savings by criteria',
    response: {
      schema: savingsQueryParamSchema
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      const entity_id = req.body?.entity_id ?? req.user!.id; // either grp or user
      const { pocket_id, start_date, end_date } = req.query;

      const filterArgs: Record<string, string> = {};
      const filters: string[] = [];

      if (pocket_id) {
        filterArgs.pocket_id = pocket_id.toString();
        filters.push('pocket_id = :pocket_id');
      }
      if (start_date && end_date) {
        filterArgs.start_date = Array.isArray(start_date)
          ? start_date[0] as string
          : start_date as string;
        filterArgs.end_date = Array.isArray(end_date)
          ? end_date[0] as string
          : end_date as string;
        filters.push('DATE(created_at) BETWEEN :start_date AND :end_date');
      } else {
        if (start_date) {
          filterArgs.start_date = Array.isArray(start_date)
            ? start_date[0] as string
            : start_date as string;
          filters.push('DATE(created_at) >= :start_date');
        }
        if (end_date) {
          filterArgs.end_date = Array.isArray(end_date)
            ? end_date[0] as string
            : end_date as string;
          filters.push('DATE(created_at)<= :end_date');
        }
      }

      const query = SQL_GET_SAVINGS({ entity_id, type_id: 1 });
      if (filters.length > 0) query.extend(`AND ${filters.join(' AND ')}`, filterArgs);
      query.extend('LIMIT 15', {});
      const savings = await query.many();
      res.json(savings);
    }
  });
};

export default getSavingsByCriteria;