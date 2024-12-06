import { z } from 'zod';
import { sql } from '../../db';
import Router from '../../router';

const SQL_INNER_BALANCE = sql<{ entity_id: number, pocket_id?: string, from?: string, to?: string }, { balance: number }>(`
  SELECT DISTINCT ON (pocket_id) balance
  FROM transactions
  WHERE entity_id = :entity_id
`);

const computeTransactionTotals = (router: Router) => {
  router.route({
    method: 'get',
    path: '/balance',
    summary: 'Get user / group balance across all pockets',
    description: 'Calculates and retrieves the available balance for a system entity (groups, pockets). Allows optional query parameters:\n\n'
      + '- **pocket_id**: Retrieves the current balance for a specific pocket.\n'
      + '- **from**: Filters transactions from a specific start date.\n'
      + '- **to**: Filters transactions up to a specific end date.\n'
      + '- **group_id**: If provided, retrieves the available balance for a group entity.',
    schema: {
      query: z.object({
        from: z.string(),
        to: z.string(),
        pocket_id: z.string(),
        group_id: z.string()
      }).partial()
    },
    response: {
      schema: z.object({ balance: z.number() })
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const entity_id = Number(req.query?.group_id) || req.user!.id;
      const { pocket_id, from, to } = req.query;

      const filterArgs: {
        entity_id: number,
        from?: string,
        to?: string,
        pocket_id?:string
      } = { entity_id };
      const filters: string[] = [];
      if (pocket_id) {
        filterArgs.pocket_id = pocket_id;
        filters.push('pocket_id = :pocket_id');
      }

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
      query.extend('ORDER BY pocket_id, created_at DESC', {});

      const balance = await query.many();
      const totalBalance = balance.reduce((sum, row) => sum + (row.balance || 0), 0);
      res.json({ balance: totalBalance });
    }
  });
};

export default computeTransactionTotals;