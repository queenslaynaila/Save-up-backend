import Router from '../../router';
import { sql } from '../../db';
import {
  Expense,
  expenseSchema
} from './schema';
import { z } from 'zod';
import  { decodeEntityAndVerifyAccess } from '../../utils';
import { entityIdParamsSchema } from '../users/schema';

const SQL_GET_EXPENSES = sql<{
  entity_id: number;
  category_id?: string;
  spent_from?: string;
  spent_to?: string;
  start_date?: string;
  end_date?: string;
}, 
Pick<Expense, 'entity_id'|'xid'|'category_id'|'description'|'amount'|'created_at'|'xid'>>(`
  SELECT entity_id, 
         xid, 
         category_id, 
         description, 
         amount, 
         spent_at, 
         created_at
  FROM expenses 
  WHERE deleted_at IS NULL
    AND entity_id = :entity_id
    AND (:category_id::INT IS NULL OR category_id = :category_id)
    AND (:spent_from::DATE IS NULL OR DATE(spent_at) >= :spent_from)
    AND (:spent_to::DATE IS NULL OR DATE(spent_at) <= :spent_to)
    AND (:start_date::DATE IS NULL OR DATE(created_at) >= :start_date)
    AND (:end_date::DATE IS NULL OR DATE(created_at) <= :end_date)
  LIMIT 15
`);

const getExpensesByEntity = (router: Router) => {
  router.route({
    method: 'get',
    path: '/:entity_id/expenses',
    summary: 'Get list of expenses by criteria',
    request: {
      params: z.object({
        entity_id: entityIdParamsSchema
      }),
      query: z.object({
        category_id: z.string().regex(/^\d+$/).optional(),
        spent_from: z.string().date().optional(),
        spent_to: z.string().date().optional(),
        start_date: z.string().date().optional(),
        end_date: z.string().date().optional()
      })
    },
    response: {
      200: {
        schema: z.array(expenseSchema)
      }
    },
    auth: true,
    handler: async (req, res) => {
      const entityId = await decodeEntityAndVerifyAccess(req, true);
      const expenses = await SQL_GET_EXPENSES({
        entity_id: entityId,
        ...req.query
      }).many();

      res.json(expenses);
    }
  });
};

export default getExpensesByEntity;
