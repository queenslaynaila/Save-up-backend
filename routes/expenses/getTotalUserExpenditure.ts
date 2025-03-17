import { z } from 'zod';
import { sql } from '../../db';
import Router from '../../router';
import verifyGroupMembership from '../../utils';

const SQL_GET_TOTAL_EXPENSES = sql<{
  entity_id: number;
  category_id?: string;
  spent_from?: string;
  spent_to?: string;
  start_date?: string;
  end_date?: string;
}, { total_expenses: number }>(`
  SELECT COALESCE(SUM(amount), 0) AS total_expenses
  FROM expenses
  WHERE entity_id = :entity_id
    AND (:category_id::INT IS NULL OR category_id = :category_id::INT)
    AND (:spent_from::DATE IS NULL OR DATE(spent_at) >= :spent_from::DATE)
    AND (:spent_to::DATE IS NULL OR DATE(spent_at) <= :spent_to::DATE)
    AND (:start_date::DATE IS NULL OR DATE(created_at) >= :start_date::DATE)
    AND (:end_date::DATE IS NULL OR DATE(created_at) <= :end_date::DATE)
`);

const getTotalUserExpenditure = (router: Router) => {
  router.route({
    method: 'get',
    path: '/:entity_id/expenses/total',
    summary: 'Get total user/group expenditure',
    request: {
      params: z.object({
        entity_id: z.union([
          z.string().regex(/^[1-9]\d*$/, "Must be a positive integer string"),
          z.literal("me"),
        ]).default('me')
      }),
      query: z.object({
        start_date: z.string().date().optional(),
        end_date: z.string().date().optional(),
        category_id: z.string().regex(/^[1-9]\d*$/).optional(),
        spent_from: z.string().date().optional(),
        spent_to: z.string().date().optional()
      })
    },
    response: {
      200: {
        schema: z.object({ total_expenses: z.number() })
      }
    },
    authMiddlewareOptions: {},
    middlewares: [verifyGroupMembership({
      privilegedRoles: 'all'
    })],
    handler: async (req, res) => {
      const entity_id = Number(req.params.entity_id);
      const { category_id, spent_from, spent_to, start_date, end_date } = req.query;

      const { total_expenses } = await SQL_GET_TOTAL_EXPENSES({
        entity_id,
        category_id,
        spent_from,
        spent_to,
        start_date,
        end_date
      }).one();

      res.json({ total_expenses });
    }
  });
};

export default getTotalUserExpenditure;