import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import  { validateRequest } from '../../middleware/validationMiddleware';
import { CreateExpenseInterface, ExpenseInterface, createExpenseSchemaValidation   } from './types';

const SQL_CREATE_EXPENSES = sql<CreateExpenseInterface, ExpenseInterface>(`
  INSERT INTO expenses (id, entity_id, category_id, description, amount_spent, date_spent)
  VALUES (COALESCE((SELECT MAX(id) FROM expenses WHERE entity_id = :entityId), 0) + 1,
           :entityId, :categoryId, :description, :amountSpent, :dateSpent )
  RETURNING id, entity_id, category_id, description, amount_spent, date_spent, created_at;
`);

export default (router: Router) => {
  router.post<Record<string,never>, ExpenseInterface, CreateExpenseInterface, Record<string,never>, Record<string,never>>(
    '/', 
    authMiddleware(), 
    validateRequest(createExpenseSchemaValidation),
    async (req, res) => {
      const { description, categoryId, amountSpent, dateSpent, entityId } = req.body;
      const expense = await SQL_CREATE_EXPENSES({
        description,
        categoryId,
        amountSpent,
        dateSpent,
        entityId
      }).one()
      return res.json(expense);
    });
};
