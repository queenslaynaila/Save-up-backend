import { z } from 'zod';
import { sql } from '../../db';
import Router from '../../router';

const SQL_GET_AGGREGATED_EXPENSES = sql<{
  agg: 'avg'|'sum'|'count'|'min'|'max';
  entity_id?: number;
  start_date?: string;
  end_date?: string;
}, { aggregated_expenses: number }>(`
  SELECT
    CASE
      WHEN :agg = 'avg' THEN AVG(amount)
      WHEN :agg = 'sum' THEN SUM(amount)
      WHEN :agg = 'count' THEN COUNT(amount)
      WHEN :agg = 'min' THEN MIN(amount)
      WHEN :agg = 'max' THEN MAX(amount)
    END AS aggregated_expenses
  FROM expenses
  WHERE (:entity_id::INT IS NULL OR entity_id = :entity_id)
    AND (:start_date::DATE IS NULL OR spent_at >= :start_date::DATE)
    AND (:end_date::DATE IS NULL OR spent_at <= :end_date::DATE)
`);

const getExpenseStats = (router: Router) => {
  router.get({
    path: '/stats/expenses',
    summary: 'Get aggregated expenses',
    schema: {
      query:z.object({
        entity_id: z.number().int().min(1).optional(),
        agg: z.enum(['avg', 'sum', 'count', 'min', 'max']),
        start_date: z.string().date().optional(),
        end_date: z.string().date().optional()
      })
    },
    response: {
      statusCode:200,
      schema: z.object({
        aggregated_expenses: z.number()
      })
    },
    handler: async (req, res) => {
      const { entity_id, agg, start_date, end_date } = req.query;
      const aggregated_expenses = await SQL_GET_AGGREGATED_EXPENSES({
        entity_id,
        agg,
        start_date,
        end_date
      }).oneFirst()
      res.json({aggregated_expenses});
    }
  });
};

export default getExpenseStats;