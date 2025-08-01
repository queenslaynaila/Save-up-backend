import Router from '../../new/router';
import { sql } from '../../db';
import { Expense, expenseSchema } from './schema';
import { z } from 'zod';
import { decodeEntityAndVerifyAccess } from '../../utils';
import { entityIdParamsSchema } from '../users/schema';

const expenseCreationParams = expenseSchema.pick({
  category_id: true,
  description: true,
  currency: true,
  amount: true,
  spent_at: true
});

type ExpenseCreationParams = z.infer<typeof expenseCreationParams>
& { entity_id: number };

const SQL_CREATE_EXPENSES = sql<
ExpenseCreationParams,
Pick<Expense, 'entity_id' | 'xid' | 'category_id' | 'description'
|'currency'| 'amount' | 'spent_at' | 'created_at'>
>(`
  INSERT INTO expenses (entity_id, xid, category_id, description, currency, amount, spent_at)
  SELECT 
    :entity_id,
    COALESCE(MAX(xid), 0) + 1,
    :category_id, 
    :description, 
    :currency,
    :amount, 
    :spent_at
  FROM expenses 
  WHERE entity_id = :entity_id
  RETURNING entity_id, xid, category_id, description, amount, spent_at, created_at;
`);

const createExpense = (router: Router) => {
  router.post({
    path: '/:entity_id/expenses',
    summary: 'Create an expense',
    schema: {
      params: z.object({
        entity_id: entityIdParamsSchema
      }),
      body: expenseSchema.pick({
        category_id: true,
        description: true,
        currency: true,
        amount: true,
        spent_at: true
      })
    },
    response: {
      statusCode: 201,
      schema: expenseSchema
    },
    auth: true,
    handler: async (req, res) => {
      const entityId = await decodeEntityAndVerifyAccess(req);
      const expense = await SQL_CREATE_EXPENSES({
        ...req.body,
        entity_id: entityId
      }).one();
      return res.json(expense);
    }
  });
};

export default createExpense;