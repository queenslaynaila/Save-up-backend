import { z } from 'zod';
import { sql } from '../../db';
import Router from '../../router';
import { ParsedQs } from 'qs';
import { entitySchema } from '../../types';

const SQL_GET_BALANCE = sql<{entity_id: number}, {total: number}>(`
  SELECT COALESCE(SUM(balance), 0) AS balance
  FROM (
       SELECT DISTINCT ON (pocket_id) balance
       FROM transactions
       WHERE entity_id = :entity_id
       ORDER BY pocket_id, created_at DESC
  ) AS current_balance_per_pocket;
`);

const computeTransactionTotals = (router: Router) => {
  router.route({
    method: 'get',
    path: '/totals',
    summary: 'Get user balance across all pockets',
    description: 'Calculates and retrieves the available balance for a system entity(grps,pockets). Allows optional query parameters:\n\n'
    + '- **pocket_id**: Retrieves the current balance for a specific pocket.\n'
    + '- **from**: Filters transactions from a specific start date.\n'
    + '- **to**: Filters transaction up to a specific end date.\n'
    + '- **group_id**: If provided, we get available balnce for a grp entity.',
    schema: {
      body: entitySchema,
      query: z.object({
        type: z.enum([
          'Saving',
          'ExternalSaving',
          'Interest',
          'Withdrawal',
          'Penalty',
          'TransferIn',
          'TransferOut',
          'Loan',
          'Repayment'
        ]).default('Saving'),
        from: z.string(),
        to: z.string(),
        pocket_id: z.string(),
        group_id: z.string()
      }).partial()
    },
    response: {
      schema: z.object({ total: z.number() })
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const entity_id = Number(req.query?.group_id) ?? req.user!.id;
      const { pocket_id, from, to } = req.query;

      const filters: string[] = [];
      const filterArgs: string | string [] | ParsedQs | ParsedQs[] = {};
      if (pocket_id) {
        filterArgs.pocket_id = pocket_id;
        filters.push('transactions.pocket_id = :pocket_id');
      }

      if (from && to) {
        filterArgs.start_date = from;
        filterArgs.end_date = to;
        filters.push('DATE(transactions.created_at) BETWEEN :start_date AND :end_date');
      } else if (from) {
        filterArgs.from = from;
        filters.push('DATE(transactions.created_at) >= :from');
      } else if (to) {
        filterArgs.to = to;
        filters.push('DATE(transactions.created_at) <= :to');
      }

      const query = SQL_GET_BALANCE({ entity_id });

      if (filters.length > 0) query.extend(`AND ${filters.join(' AND ')}`, filterArgs);
      const { total } = await query.one();
      res.json({ total });
    }
  });
};

export default computeTransactionTotals;