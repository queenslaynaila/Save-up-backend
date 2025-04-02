import { z } from 'zod';
import { sql } from '../../db';
import Router from '../../router';
import { decodeEntityAndVerifyAccess } from '../../utils';
import { entityIdParamsSchema } from '../users/schema';
import logger from '../../logger';

const SQL_GET_TOTAL_EXPENSES = sql<{
  entity_id: number;
  category_id?: number;
  spent_from?: string;
  spent_to?: string;
  start_date?: string;
  end_date?: string;
},   { agregated_value: number }>(`
  SELECT COALESCE(SUM(amount), 0) AS agregated_value
  FROM expenses
  WHERE entity_id = :entity_id
         AND (:from::DATE IS NULL OR created_at::DATE >= :from)
      AND (:to::DATE IS NULL OR created_at::DATE <= :to)
`);

const SQL_TOTAL_SAVINGS = sql<
  {
    entity_id: number;
    from?: string;
    to?: string;
  },
  { agregated_value: number }
>(`
  SELECT 
    COALESCE(SUM(transactions.delta), 0) AS  agregated_value
  FROM transactions
  JOIN transaction_types 
    ON transactions.type_id = transaction_types.id
  JOIN pockets 
    ON transactions.entity_id = pockets.entity_id 
    AND transactions.pocket_id = pockets.xid
  WHERE transactions.entity_id = :entity_id
    AND transaction_types.slug = 'Saving'
    AND (:from::DATE IS NULL OR transactions.created_at::DATE >= :from)
    AND (:to::DATE IS NULL OR transactions.created_at::DATE <= :to);
`);

const SQL_GET_BALANCE = sql<
  {
    entity_id: number;
    pocket_id?: number;
    from?: string;
    to?: string;
  },
  { agregated_value: number }
>(`
  SELECT COALESCE(SUM(balance), 0) AS  agregated_value
  FROM (
    SELECT DISTINCT ON (pocket_id) balance
    FROM transactions
    WHERE entity_id = :entity_id
      AND (:pocket_id::INT IS NULL OR pocket_id = :pocket_id)
      AND (:from::DATE IS NULL OR created_at::DATE >= :from) 
      AND (:to::DATE IS NULL OR created_at::DATE <= :to) 
    ORDER BY pocket_id, xid DESC
  ) latest_balances
`);

const SQL_GET_AGGREGATES = sql<
  {
    entity_id: number;
    pocket_id?: number;
    from?: string;
    to?: string;
    agg: 'sum' | 'avg' | 'max' | 'min';
    column: string;
    //table: string;
  },
  { agregated_value: number }
>(`
  WITH aggregation AS (
    SELECT
      CASE
        WHEN :agg = 'sum' THEN COALESCE(SUM(amount), 0)
        WHEN :agg = 'max' THEN COALESCE(MAX(amount), 0)
        WHEN :agg = 'min' THEN COALESCE(MIN(amount), 0)
        WHEN :agg = 'avg' THEN COALESCE(AVG(amount), 0)
      END AS aggregated_value
    FROM expenses
    WHERE entity_id = :entity_id
      AND (:from::DATE IS NULL OR created_at::DATE >= :from)
      AND (:to::DATE IS NULL OR created_at::DATE <= :to)
  )
  SELECT aggregated_value FROM aggregation
`);

const getStats = (router: Router) => {
  router.route({
    method: 'get',
    path: '/:entity_id/stats',
    summary: 'Retrieve financial stats for an entity',
    auth: true,
    schema: {
      params: z.object({
        entity_id: entityIdParamsSchema
      }),
      query: z.object({
        resource: z.enum([
          'Savings',
          'Expenses',
          'Balance',
          'Withdrawals',
          'TransferOuts',
          'TransferIn',
          'Penalties'
        ]),
        agg: z.enum(['sum', 'avg', 'max', 'min']),
        from: z.string().date().optional(),
        to: z.string().date().optional(),
        pocket_id: z.number().int().optional()
      }).partial().required({
        resource: true,
        agg: true
      })
    },
    response: {
      schema: z.object({
        aggregated_value: z.number()
      })
    },
    handler: async (req, res) => {
      const entityId = await decodeEntityAndVerifyAccess(req, true);
      const { from, to, pocket_id, resource, agg } = req.query;

      let column = '';
      let table = '';

      if (resource === 'Expenses') {
        column = 'amount';
        table = 'expenses';
      } else if (resource === 'Balance') {
        column = 'balance';
        table = 'transactions'
      } else {
        column = 'delta';
        table = 'transactions';
      }

      const agregatedValue = await SQL_GET_AGGREGATES({
        entity_id: entityId,
        from,
        to,
        pocket_id,
        agg,
        column,
        //table
      }).oneFirst().catch(err => {
        logger.info(`err is ${err}`)
        throw err;
      }
      );

      return res.json({ aggregated_value: agregatedValue });
    }
  });
};

export default getStats;