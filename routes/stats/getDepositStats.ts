import Router from '../../core/router';
import { sql } from '../../db';
import { z } from 'zod';

export const statsQuerySchema = z.object({
  pocket_id: z.number().int().min(1).optional(),
  entity_id: z.number().int().min(1).optional(),
  agg: z.enum(['avg', 'sum', 'count', 'min', 'max']),
  slug: z.string().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional()
});

export type Stats = z.infer<typeof statsQuerySchema>;

const savingStatsSchema = z.object({
  pocket_name: z.string(),
  aggregated_savings: z.number()
});

type SavingStats = z.infer<typeof savingStatsSchema>

const SQL_GET_AGGREGATED_SAVINGS = sql<Stats, SavingStats>(`
 SELECT
  pockets.name AS pocket_name,
  CASE
    WHEN :agg = 'avg' THEN AVG(delta)
    WHEN :agg = 'sum' THEN SUM(delta)
    WHEN :agg = 'count' THEN COUNT(delta)
    WHEN :agg = 'min' THEN MIN(delta)
    WHEN :agg = 'max' THEN MAX(delta)
  END AS aggregated_savings
  FROM transactions
  JOIN transaction_types 
    ON transactions.type_id = transaction_types.id
  JOIN pockets 
    ON pockets.entity_id = transactions.entity_id 
    AND pockets.xid = transactions.pocket_id
  WHERE transaction_types.slug = :slug
    AND (:entity_id::INT IS NULL OR transactions.entity_id = :entity_id)
    AND(:pocket_id::INT IS NULL OR transactions.pocket_id = :pocket_id)
    AND (:start_date::DATE IS NULL OR transactions.created_at >= :start_date::DATE)
    AND (:end_date::DATE IS NULL OR transactions.created_at <= :end_date::DATE)
  GROUP BY pockets.name
`);

const getDepositStats = (router: Router) => {
  router.get({
    path: '/transactions/stats/savings',
    summary: 'Get deposit stats',
    auth: true,
    schema: {
      query: statsQuerySchema
    },
    response: {
      statusCode: 200,
      schema: z.array(savingStatsSchema)
    },
    handler: async (req, res) => {
      const { entity_id, agg, start_date, end_date, pocket_id } = req.query;
      const aggregated_savings = await SQL_GET_AGGREGATED_SAVINGS({
        slug: 'Saving',
        entity_id,
        pocket_id,
        agg,
        start_date,
        end_date
      }).many();
      res.json(aggregated_savings);
    }
  });
};

export default getDepositStats;