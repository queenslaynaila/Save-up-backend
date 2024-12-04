import { z } from 'zod';
import { sql } from '../../db';
import Router from '../../router';
import { ParsedQs } from 'qs';
import { entitySchema } from '../../types';

const SQL_TRANSACTION_AGREGATES = sql<{entity_id: number}, {total: number}>(`
  SELECT 
    COALESCE(SUM(transactions.delta), 0) AS total
  FROM transactions
  JOIN transaction_types 
    ON transactions.type_id = transaction_types.id
  WHERE transactions.entity_id = :entity_id
`);

const ComputeTransactionTotals = (router: Router) => {
  router.route({
    method: 'get',
    path: '/totals',
    summary: 'Get total user/ group transactions for all transaction types expenditure',
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
        pocket_id: z.string()
      }).partial()
    },
    response: {
      schema: z.object({ total: z.number() })
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const entity_id = req.body?.entity_id ?? req.user!.id;
      const { type = 'Saving', pocket_id, from, to } = req.query;

      const filters: string[] = [];
      const filterArgs: string | string [] | ParsedQs | ParsedQs[] = {};

      if (type) {
        filterArgs.type = type;
        filters.push('transaction_types.slug = :type');
      }

      if (pocket_id) {
        filterArgs.pocket_id = pocket_id;
        filters.push('transactions.pocket_id = :pocket_id');
      }

      if (from && to) {
        filterArgs.from = from;
        filterArgs.to = to;
        filters.push('DATE(transactions.created_at) BETWEEN :start_date AND :end_date');
      } else {
        if (from) {
          filterArgs.from = from;
          filters.push('DATE(transactions.created_at) >= :from');
        }

        if (to) {
          filterArgs.to = to;
          filters.push('DATE(transactions.created_at) <= :to');
        }
      }

      const query = SQL_TRANSACTION_AGREGATES({ entity_id });

      if (filters.length > 0) query.extend(`AND ${filters.join(' AND ')}`, filterArgs);
      const { total } = await query.one();
      res.json({ total });
    }
  });
};

export default ComputeTransactionTotals;