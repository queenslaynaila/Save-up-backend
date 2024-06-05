import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import  { validateRequest } from '../../middleware/validationMiddleware';
import { CreateExpenseInterface, ExpenseInterface, createExpenseSchema } from './types';

const SQL_CREATE_EXPENSES = sql<CreateExpenseInterface, ExpenseInterface>(`
  INSERT INTO expenses (entity_id, xid, category_id, description, amount, spent_at)
  SELECT 
      :entity_id,
      COALESCE(MAX(xid), 0) + 1,
      :category_id, 
      :description, 
      :amount, 
      :spent_at 
  FROM expenses 
  WHERE entity_id = :entity_id
  RETURNING entity_id, xid, category_id, description, amount, spent_at, created_at;
`);

export default (router: Router) => {
  router.post<Record<string,never>, ExpenseInterface, CreateExpenseInterface, Record<string,never>, Record<string,never>>(
    '/', 
    authMiddleware(), 
    validateRequest(createExpenseSchema),
    async (req, res) => {
      const entity_id = req.body.entity_id ?? req.user!.id;
      const expense = await SQL_CREATE_EXPENSES({
        ...req.body, entity_id
      }).one();
      return res.json(expense);
    });
}