import Router from '../../router';
import { sql } from '../../db';
import HttpError from '../../httpError';
import {
  expenseSchema,
  Expense
} from './schema';
import { z } from 'zod';
import verifyGroupMembership from '../../utils';

const expenseUpdateParams = expenseSchema.pick({
  category_id: true,
  description: true,
  amount: true,
  spent_at: true
}).partial();

type ExpenseInterface = z.infer<typeof expenseUpdateParams>;

const SQL_UPDATE_EXPENSE = sql<ExpenseInterface & {entity_id:number, xid:number},
Expense>(`
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
    path: '/:xid',
    summary: 'Update an expense',
    request: {
      params: z.object({
        xid: z.string()
      }),
      body: expenseUpdateParams,
      query: z.object({
        group_id: z.string().regex(/^\d+$/).optional()
      })
    },
    response: {
      200: {
        schema: expenseSchema
      }
    },
    authMiddlewareOptions: {},
    middlewares: [verifyGroupMembership()],
    handler: async (req, res) => {
      const entity_id = Number(req.query.group_id) || req.user!.id;
      const xid = Number(req.params.xid);
      const { description, category_id, amount, spent_at } = req.body;
      const result = await SQL_UPDATE_EXPENSE({
        description, category_id, amount, spent_at, entity_id, xid
      }).one(new HttpError(404));
      res.json(result);
    }
  });
};

export default updateExpense;