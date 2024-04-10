import authMiddleware from '../../middleware/auth';
import { Router } from 'express';
import { CreateExpenseInterface , ExpenseInterface ,BaseExpenseSchema  } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';
import  { validateRequest } from '../../middleware/validationMiddleware';

const SQL_CREATE_EXPENSES = sql<CreateExpenseInterface, ExpenseInterface >(`
  INSERT INTO expenses (id,entity_id,category_id,description, amount,expense_spent_at)
  SELECT COALESCE((SELECT MAX(id) FROM expenses WHERE entity_id = :entity_id), 0) + 1,
  :entity_id,:description, :category_id, :amount, :expense_date
  RETURNING entity_id,id,category_id,description,amount_spent,date_spent
`);

export default (router: Router) => {
  router.post<Record<string, never>,ExpenseInterface,CreateExpenseInterface,Record<string, never>,
  Record<string, never> >(
    '/', 
    authMiddleware(), 
    validateRequest(BaseExpenseSchema),
    async (req, res) => {
      const { description, category_id, amount_spent, date_spent, entity_id } = req.body;
      const loggedInUserId = req.user!.id;
      const authenticatedUserId = req.user?.id;
      if (authenticatedUserId !== entity_id) {
        throw new HttpError(403, 'Forbidden');
      }
      const expense = await SQL_CREATE_EXPENSES({
        description,
        category_id,
        amount_spent,
        date_spent,
        entity_id: loggedInUserId,
      })
        .one()
      return res.json(expense);
    });
};
