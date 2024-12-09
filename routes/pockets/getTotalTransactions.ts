import { z } from 'zod';
import { sql } from '../../db';
import Router from '../../router';
import logger from '../../logger';

const SQL_INNER_BALANCE = sql<{ entity_id: number, pocket_id?: string, from?: string, to?: string }, {pocket_id:number, total_savings: number }>(`
    SELECT 
      transactions.pocket_id, 
      SUM(transactions.delta) AS total_savings
  FROM transactions
  JOIN transaction_types ON transactions.type_id = transaction_types.id
  WHERE transactions.entity_id = 66
  AND transaction_types.slug = 'Saving'
`);

const computeTransactionTotals = (router: Router) => {
  router.route({
    method: 'get',
    path: '/stats',
    summary: 'Get user / group balance across all pockets',
    description: 'Calculates and retrieves the available balance for a system entity (groups, pockets). Allows optional query parameters:\n\n'
      + '- **pocket_id**: Retrieves the current balance for a specific pocket.\n'
      + '- **from**: Filters transactions from a specific start date.\n'
      + '- **to**: Filters transactions up to a specific end date.\n'
      + '- **group_id**: If provided, retrieves the available balance for a group entity.',
    request: {
      query: z.object({
        from: z.string(),
        to: z.string(),
        group_id: z.string()
      }).partial()
    },
    response: {
      200: {
        schema: z.array(
          z.object({
            pocket_id: z.number(),
            total_savings: z.number()
          })
        )
      }
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const entity_id = Number(req.query?.group_id) || req.user!.id;
      const { from, to } = req.query;

      const filterArgs: {
        entity_id: number,
        from?: string,
        to?: string
      } = { entity_id };
      const filters: string[] = [];

      if (from && to) {
        filterArgs.from = from;
        filterArgs.to = to;
        filters.push('DATE(transactions.created_at) BETWEEN :from AND :to');
      } else if (from) {
        filterArgs.from = from;
        filters.push('DATE(transactions.created_at) >= :from');
      } else if (to) {
        filterArgs.to = to;
        filters.push('DATE(transactions.created_at) <= :to');
      }

      const query = SQL_INNER_BALANCE(filterArgs);
      if (filters.length > 0) query.extend(`AND ${filters.join(' AND ')}`, filterArgs);
      query.extend('GROUP BY transactions.pocket_id LIMIT 15', {});
      logger.info('Query:', query);
      const stats = await query.many();
      res.json(stats);
    }
  });
};

export default computeTransactionTotals;