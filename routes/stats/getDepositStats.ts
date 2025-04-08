import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';

const SQL_GET_AGGREGATED_DEPOSITS = sql<{
    agg: 'avg'|'sum'|'count'|'min'|'max';
    entity_id?: number;
    start_date?: string;
    end_date?: string;
    slug:string
}, { aggregated_deposits: number }>(`
  SELECT
    CASE
      WHEN :agg = 'avg' THEN AVG(delta)
      WHEN :agg = 'sum' THEN SUM(delta)
      WHEN :agg = 'count' THEN COUNT(delta)
      WHEN :agg = 'min' THEN MIN(delta)
      WHEN :agg = 'max' THEN MAX(delta)
    END AS aggregated_deposits
  FROM transactions
  JOIN transaction_types 
      ON transactions.type_id = transaction_types.id
  WHERE transaction_types.slug = :slug
  AND (:entity_id::INT IS NULL OR transactions.entity_id = :entity_id)
    AND (:start_date::DATE IS NULL OR transactions.created_at >= :start_date::DATE)
    AND (:end_date::DATE IS NULL OR transactions.created_at <= :end_date::DATE)
`);

const getDepositStats = (router: Router) => {
    router.route({
        method: 'get',
        path: '/transactions/stats/deposits',
        summary: 'Get deposit stats',
        auth: true,
        schema: {
            query: z.object({
                entity_id: z.number().int().min(1).optional(),
                agg: z.enum(['avg', 'sum', 'count', 'min', 'max']),
                start_date: z.string().datetime().optional(),
                end_date: z.string().datetime().optional()
            })
        },
        response: {
            statusCode:200,
            schema: z.object({
                aggregated_deposits: z.number()
            })
        },
        handler: async (req, res) => {
            const { entity_id, agg, start_date, end_date } = req.query;
            const aggregated_deposits = await SQL_GET_AGGREGATED_DEPOSITS({
                slug:'Savings',
                entity_id,
                agg,
                start_date,
                end_date
            }).oneFirst()
            res.json({aggregated_deposits});
        }
    });
};

export default getDepositStats;