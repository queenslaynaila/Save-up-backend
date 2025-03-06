import Router from '../../router';
import { sql } from '../../db';
import {
  Expense,
  expenseSchema
} from './schema';
import { z } from 'zod';
import verifyGroupMembership from '../../utils';

const expenseCreationParams = expenseSchema.pick({
  category_id: true,
  description: true,
  amount: true,
  spent_at: true
});
type ExpenseCreationParams = z.infer<typeof expenseCreationParams>;

const SQL_CREATE_EXPENSES = sql<ExpenseCreationParams & {entity_id:number}, Expense>(`
  INSERT INTO expenses (entity_id, xid, category_id, description, amount, spent_at)
  SELECT 
      :entity_id,
      COALESCE(MAX(xid), 0) + 1,
      :category_id, 
      :description, 
      :amount, 
      COALESCE(:spent_at::DATE, NULL)
  FROM expenses 
  WHERE entity_id = :entity_id
  RETURNING entity_id, xid, category_id, description, amount, spent_at, created_at;
`);

const createExpense = (router: Router) => {
  router.route({
    method: 'post',
    path: '/:entity_id/',
    summary: 'Create an expense',
    request: {
      params: z.object({
        entity_id: z.union([
          z.string().regex(/^[1-9]\d*$/, "Must be a positive integer string"),
          z.literal("me"), 
        ]).default('me' )
      }),
      body: expenseCreationParams,
    },
    response: {
      201: {
        schema: expenseSchema
      }
    },
    authMiddlewareOptions: {},
    middlewares: [verifyGroupMembership(true)],
    handler: async (req, res) => {
      const entity_id = Number(req.params.entity_id);
      const { category_id, description, amount, spent_at } = req.body;
      const expense = await SQL_CREATE_EXPENSES({
        category_id,
        description,
        amount,
        spent_at,
        entity_id
      }).one();
      return res.json(expense);
    }
  });
};

export default createExpense;