import { z } from 'zod';
import { sql } from '../../db';
import Router from '../../router';
import verifyGroupMembership from '../../middlewares/verifyGrpMembership';

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
    path: '/total-savings',
    summary: 'Get total savings across all pockets for a user or group',
    description: 'Calculates and retrieves the total amount ever deposited (as savings) into each pocket. Does not take into account any withdrawals from the pocket. Allows optional query parameters:\n\n'
  + '- **pocket_id**: Retrieves the total savings for a specific pocket.\n'
  + '- **from**: Filters transactions from a specific start date.\n'
  + '- **to**: Filters transactions up to a specific end date.\n'
  + '- **group_id**: If provided, retrieves the total savings for a group entity.',
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
            name: z.string(),
            total_savings: z.number()
          })
        )
      }
    },
    authMiddlewareOptions: {},
    middlewares: [verifyGroupMembership(true)],
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
      query.extend('GROUP BY pockets.name LIMIT 15', {});
      const stats = await query.many();
      res.json(stats);
    }
  });
};

export default getTotalSavings;