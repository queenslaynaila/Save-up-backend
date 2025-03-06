import { z } from 'zod';
import { sql } from '../../db';
import Router from '../../router';
import verifyGroupMembership from '../../utils';

const SQL_INNER_BALANCE = sql<{ entity_id: number, pocket_id?: string, from?: string, to?: string }, {name:string, total_savings: number }>(`
  SELECT 
    pockets.name,
    COALESCE(SUM(transactions.delta), 0) AS total_savings
  FROM transactions
  JOIN transaction_types ON transactions.type_id = transaction_types.id
  JOIN pockets ON transactions.entity_id = pockets.entity_id 
    AND transactions.pocket_id = pockets.xid
  WHERE transactions.entity_id = :entity_id
  AND transaction_types.slug = 'Saving'
`);

const getTotalSavings = (router: Router) => {
  router.route({
    method: 'get',
    path: '/:entity_id/total-savings',
    summary: 'Get total savings across all pockets for a user or group',
    request: {
      params: z.object({
        entity_id: z.union([
          z.string().regex(/^[1-9]\d*$/, "Must be a positive integer string"),
          z.literal("me"), 
        ]).default('me' )
      }),
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
            name: z.string(),
            total_savings: z.number()
          })
        )
      }
    },
    authMiddlewareOptions: {},
    middlewares: [verifyGroupMembership()],
    handler: async (req, res) => {
      const entityId = Number(req.params.entity_id);
      const { from, to } = req.query;

      const filterArgs: {
        entity_id: number,
        from?: string,
        to?: string
      } = { entity_id: entityId };
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
      query.extend('GROUP BY pockets.name LIMIT 15', {});
      const stats = await query.many();
      res.json(stats);
    }
  });
};

export default getTotalSavings;