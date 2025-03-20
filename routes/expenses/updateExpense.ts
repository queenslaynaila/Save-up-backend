import Router from '../../router';
import { sql } from '../../db';
import HttpError from '../../httpError';
import {
  expenseSchema,
  Expense
} from './schema';
import { z } from 'zod';
import  { decodeEntityAndVerifyAccess } from '../../utils';
import { ExpenseCreationParams } from './createExpense';

const SQL_UPDATE_EXPENSE = sql<
ExpenseCreationParams & {xid:number},
Pick<Expense, 'entity_id'|'xid'|'category_id'|'description'|'amount'|'spent_at'|'created_at'>>(`
  UPDATE expenses
  SET description = COALESCE(:description, expenses.description),
      category_id = COALESCE(:category_id, expenses.category_id),
      amount = COALESCE(:amount, expenses.amount),
      spent_at = COALESCE(:spent_at , expenses.spent_at)
  WHERE entity_id = :entity_id 
  AND xid = :xid
  AND deleted_at IS NULL
  RETURNING entity_id, xid, category_id, description, amount, spent_at, created_at;
`);

const updateExpense = (router: Router) => {
  router.route({
    method: 'patch',
    path: '/:entity_id/expenses/:xid',
    summary: 'Update an expense',
    request: {
      params: z.object({
        entity_id: z.number().int(),
        xid: z.number().int()
      }),
      body:expenseSchema.pick({
        category_id: true,
        description: true,
        amount: true,
        spent_at: true
      })
    },
    response: {
      200: {
        schema: expenseSchema
      }
    },
    auth: true,
    handler: async (req, res) => {
      const entityId = await decodeEntityAndVerifyAccess(req);
      const expense = await SQL_UPDATE_EXPENSE({
        entity_id: entityId, 
        xid: req.params.xid,
        ...req.body,
      }).one(new HttpError(404));
      res.json(expense);
    }
  });
};

export default updateExpense;