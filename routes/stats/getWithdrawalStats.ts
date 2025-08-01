import Router from '../../new/router';
import { sql } from '../../db';
import { z } from 'zod';
import { statsQuerySchema, Stats } from './getDepositStats';

const SQL_GET_AGGREGATED_WITHDRAWALS = sql<Stats, { aggregated_deposits: number }>(`
  SELECT
    CASE
      WHEN :agg = 'avg' THEN AVG(delta)
      WHEN :agg = 'sum' THEN SUM(delta)
      WHEN :agg = 'count' THEN COUNT(delta)
      WHEN :agg = 'min' THEN MIN(delta)
      WHEN :agg = 'max' THEN MAX(delta)
    END AS aggregated_withdrawals
  FROM transactions
  JOIN transaction_types 
      ON transactions.type_id = transaction_types.id
  WHERE transaction_types.slug = :slug
  AND (:entity_id::INT IS NULL OR transactions.entity_id = :entity_id)
    AND (:start_date::DATE IS NULL OR transactions.created_at >= :start_date::DATE)
    AND (:end_date::DATE IS NULL OR transactions.created_at <= :end_date::DATE)
`);

const getWithdrawalStats = (router: Router) => {
  router.get({
    path: '/transactions/stats/withdrawals',
    summary: 'Get withdrawal stats',
    auth: true,
    schema: {
      query: statsQuerySchema
    },
    response: {
      statusCode: 200,
      schema: z.object({
        aggregated_withdrawals: z.number()
      })
    },
    handler: async (req, res) => {
      const { entity_id, agg, start_date, end_date, pocket_id } = req.query;
      const aggregated_withdrawals = await SQL_GET_AGGREGATED_WITHDRAWALS({
        slug: 'Withdrawal',
        entity_id,
        pocket_id,
        agg,
        start_date,
        end_date
      }).oneFirst();
      res.json({ aggregated_withdrawals });
    }
  });
};

export default getWithdrawalStats;