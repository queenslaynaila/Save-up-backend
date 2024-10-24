import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import validateRequest from '../../middleware/validationMiddleware';
import {
  ExpenseCreationInterface,
  BaseExpenseInterface,
  expenseCreationSchema
} from './types';

const SQL_CREATE_EXPENSES = sql<ExpenseCreationInterface, BaseExpenseInterface>(`
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

export default (router: Router) => {
  router.post<Record<string, never>, BaseExpenseInterface, ExpenseCreationInterface,
  Record<string, never>>(
    '/',
    validateRequest({
      body: expenseCreationSchema
    }),
    authMiddleware(),
    async (req, res) => {
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
  );
};