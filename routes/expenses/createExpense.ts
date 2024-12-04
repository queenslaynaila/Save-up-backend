import Router from '../../router';
import { sql } from '../../db';
import {
  ExpenseCreationInterface,
  Expense,
  expenseCreationSchema,
  ExpenseSchema
} from './types';

const SQL_CREATE_EXPENSES = sql<ExpenseCreationInterface, Expense>(`
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
    path: '/',
    summary: 'Create an expense',
    schema: {
      body: expenseCreationSchema
    },
    response: {
      schema: ExpenseSchema,
      statusCode: 201
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const entity_id = req.body.entity_id ?? req.user!.id;
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