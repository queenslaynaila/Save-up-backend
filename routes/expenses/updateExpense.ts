import Router from '../../router';
import { sql } from '../../db';
import HttpError from '../../httpError';

import {
  expenseBodySchema,
  ExpenseUpdateInterface,
  ExpenseUpdateRes
} from './types';
import { z } from 'zod';

const SQL_UPDATE_EXPENSE = sql<ExpenseUpdateInterface, ExpenseUpdateRes>(`
  UPDATE expenses
  SET description = COALESCE(:description, expenses.description),
      category_id = COALESCE(:category_id, expenses.category_id),
      amount = COALESCE(:amount, expenses.amount),
      spent_at = COALESCE(:spent_at , expenses.spent_at)
  WHERE entity_id = :entity_id 
  AND xid = :xid
  AND deleted_at IS NULL
  RETURNING category_id, description, amount, spent_at
`);

const updateExpense = (router: Router) => {
  router.route({
    method: 'patch',
    path: '/:id',
    summary: 'Update an expense',
    request: {
      params: z.object({
        id: z.string()
      }),
      body: expenseBodySchema
    },
    response: {
      200: {
        schema: expenseBodySchema
      }
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const entity_id = req.body.entity_id ?? req.user!.id;
      const xid = Number(req.params.id);
      const { description, category_id, amount, spent_at } = req.body;
      const result = await SQL_UPDATE_EXPENSE({
        description, category_id, amount, spent_at, entity_id, xid
      }).one(new HttpError(404));
      res.json(result);
    }
  });
};

export default updateExpense;