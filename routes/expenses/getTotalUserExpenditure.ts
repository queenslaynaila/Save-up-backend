import { z } from 'zod';
import { sql } from '../../db';
import Router from '../../router';
import { decodeEntityAndVerifyAccess } from '../../utils';
import { entityIdParamsSchema } from '../users/schema';

const SQL_GET_TOTAL_EXPENSES = sql<{
  entity_id: number;
  category_id?: number;
  spent_from?: string;
  spent_to?: string;
  start_date?: string;
  end_date?: string;
}, { total_expenses: number }>(`
  SELECT COALESCE(SUM(amount), 0) AS total_expenses
  FROM expenses
  WHERE entity_id = :entity_id
    AND (:category_id IS NULL OR category_id = :category_id)
    AND (:spent_from IS NULL OR spent_at::DATE >= :spent_from)
    AND (:spent_to IS NULL OR spent_at::DATE <= :spent_to)
    AND (:start_date IS NULL OR created_at::DATE >= :start_date)
    AND (:end_date IS NULL OR created_at::DATE <= :end_date)
`);

const getTotalUserExpenditure = (router: Router) => {
  router.route({
    method: 'get',
    path: '/:entity_id/expenses/total',
    summary: 'Get total user/group expenditure',
    schema: {
      params: z.object({
        entity_id: entityIdParamsSchema
      }),
      query: z.object({
        start_date: z.string().date().optional(),
        end_date: z.string().date().optional(),
        category_id: z.number().optional(),
        spent_from: z.string().date().optional(),
        spent_to: z.string().date().optional()
      })
    },
    response: {
        schema: z.object({
           total_expenses: z.number() 
        })
    },
    auth: true,
    handler: async (req, res) => {
      const entityId = await decodeEntityAndVerifyAccess(req, true);
      const { total_expenses } = await SQL_GET_TOTAL_EXPENSES({
        entity_id: entityId,
        ...req.query
      }).one();
      res.json({total_expenses});
    }
  });
};

export default getTotalUserExpenditure;