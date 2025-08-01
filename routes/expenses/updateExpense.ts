import Router from '../../new/router';
import { sql } from '../../db';
import HttpError from '../../httpError';
import {
  expenseSchema,
  Expense
} from './schema';
import { z } from 'zod';
import { decodeEntityAndVerifyAccess } from '../../utils';
import { entityIdParamsSchema } from '../users/schema';

type ExpenseParams = Pick<Expense, 'entity_id'|'xid'> &
Partial<Pick<Expense, 'description'|'category_id'|'amount'|'spent_at'>>

const SQL_UPDATE_EXPENSE = sql<
ExpenseParams,
Pick<Expense, 'category_id'|'description'|'amount'|'spent_at'>>(`
  UPDATE expenses
  SET description = COALESCE(:description, expenses.description),
      category_id = COALESCE(:category_id, expenses.category_id),
      amount = COALESCE(:amount, expenses.amount),
      spent_at = COALESCE(:spent_at , expenses.spent_at)
  WHERE entity_id = :entity_id 
  AND xid = :xid
  AND deleted_at IS NULL
  RETURNING 
    category_id, 
    description, 
    amount, 
    spent_at;
`);

const updateExpense = (router: Router) => {
  router.patch({
    path: '/:entity_id/expenses/:xid',
    summary: 'Update an expense',
    schema: {
      params: z.object({
        entity_id: entityIdParamsSchema,
        xid: z.number().int().min(1)
      }),
      body: expenseSchema.pick({
        category_id: true,
        description: true,
        amount: true,
        spent_at: true
      }).partial()
    },
    response: {
      schema: expenseSchema.pick({
        category_id: true,
        description: true,
        amount: true,
        spent_at: true
      })
    },
    auth: true,
    handler: async (req, res) => {
      const entityId = await decodeEntityAndVerifyAccess(req);
      const { category_id, description, amount, spent_at } = req.body;
      const expense = await SQL_UPDATE_EXPENSE({
        entity_id: entityId,
        xid: req.params.xid,
        category_id,
        description,
        amount,
        spent_at
      }).one(new HttpError(404));
      res.json(expense);
    }
  });
};

export default updateExpense;