import { Router } from 'express';
import { sql } from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import { UpdateExpenseInterface, ExpenseInterface, validateUpdateExpenseSchema } from './types';

const SQL_UPDATE_EXPENSE= sql<UpdateExpenseInterface,ExpenseInterface>(`
  UPDATE expenses
  SET description = COALESCE(:description, expenses.description),
      category_id = COALESCE(:category_id, expenses.category_id),
      amount_spent = COALESCE(:amount_spent, expenses.amount_spent),
      date_spent = COALESCE(:date_spent , expenses.date_spent )
  WHERE entity_id = :entity_id AND id = :id
  RETURNING entity_id,id,category_id,description,amount_spent,date_spent
`);

export default (router: Router) => {
  router.patch<{ id: string },ExpenseInterface, UpdateExpenseInterface, Record<string,never>>(
    '/:id', 
    authMiddleware(), 
    validateRequest(validateUpdateExpenseSchema),
    async (req, res) => {
      const userId = req.user!.id;
      const expenseId = parseInt(req.params.id);
      const { description, category_id, amount_spent,date_spent} = req.body;
      const result = await SQL_UPDATE_EXPENSE({
        entity_id: userId,
        id: expenseId,
        description,
        category_id,
        amount_spent,
        date_spent,
      }).one(new HttpError(404, 'Not found'));
      res.json(result);
    });
};
