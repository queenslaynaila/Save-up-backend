import Router from '../../router';
import { sql } from '../../db';
import {
  Expense,
  expenseSchema
} from './schema';
import { z } from 'zod';
import { decodeEntityAndVerifyAccess } from '../../utils';
import { entityIdParamsSchema } from '../users/schema';

const SQL_GET_EXPENSES = sql<{
  entity_id: number;
  category_id?:number;
  spent_from?: string;
  spent_to?: string;
  start_date?: string;
  end_date?: string;
},
Pick<Expense, 'entity_id'|'xid'|'category_id'|'description'|
'amount'|'currency'|'spent_at'|'created_at'>>(`
  SELECT entity_id, 
         xid, 
         category_id, 
         description, 
         currency,
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
  router.get({
    path: '/:entity_id/expenses',
    summary: 'Get list of expenses by criteria',
    schema: {
      params: z.object({
        entity_id: entityIdParamsSchema
      }),
      query: z.object({
        category_id: z.number().int().min(1),
        spent_from: z.string(),
        spent_to: z.string(),
        start_date: z.string(),
        end_date: z.string()
      }).partial()
    },
    response: {
      schema: z.array(expenseSchema.pick({
        entity_id: true,
        xid: true,
        category_id: true,
        description: true,
        currency: true,
        amount: true,
        spent_at: true,
        created_at: true
      }))
    },
    auth: true,
    handler: async (req, res) => {
      const entityId = await decodeEntityAndVerifyAccess(req, true);
      const {
        category_id,
        spent_from,
        spent_to,
        start_date,
        end_date
      } = req.query;

      const expenses = await SQL_GET_EXPENSES({
        entity_id: entityId,
        category_id,
        spent_from,
        spent_to,
        start_date,
        end_date
      }).many();

      res.json(expenses);
    }
  });
};

export default getExpensesByEntity;
