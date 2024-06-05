import { Router } from 'express';
import { sql } from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import { UpdateExpenseInterface, ExpenseInterface, validateUpdateExpenseSchema } from './types';
import { IdParamInterface } from '../../globalTypes/index'

const SQL_UPDATE_EXPENSE= sql<UpdateExpenseInterface,ExpenseInterface>(`
  UPDATE expenses
  SET description = COALESCE(:description, expenses.description),
      category_id = COALESCE(:category_id, expenses.category_id),
      amount = COALESCE(:amount_spent, expenses.amount_spent),
      spent_at = COALESCE(:date_spent , expenses.date_spent)
  WHERE entity_id = :entity_id 
  AND xid = :xid
  AND deleted_at IS NULL
  RETURNING category_id, description, amount, spent_at
`);

export default (router: Router) => {
  router.patch<IdParamInterface, ExpenseInterface, UpdateExpenseInterface, Record<string,never>>(
    '/:id', 
    authMiddleware(), 
    validateRequest(validateUpdateExpenseSchema),
    async (req, res) => {
      const entity_id = req.body.entity_id ? req.body.entity_id : req.user!.id;
      const xid = parseInt(req.params.id);
      const result = await SQL_UPDATE_EXPENSE({
        ...req.body, entity_id, xid
      }).one(new HttpError(404, 'Not found'));
      res.json(result);
    });
};