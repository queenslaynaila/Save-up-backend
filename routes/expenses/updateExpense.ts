import { Router } from 'express';
import { sql } from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import { ExpenseUpdateInterface, 
  ExpenseUpdateRes, 
  ExpenseUpdateValidationSchema 
} from './types';
import { IdParamInterface } from '../../globalTypes/index'

const SQL_UPDATE_EXPENSE= sql<ExpenseUpdateInterface, ExpenseUpdateRes>(`
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

export default (router: Router) => {
  router.patch<IdParamInterface, ExpenseUpdateRes, ExpenseUpdateInterface, 
  Record<string,never>>(
    '/:id', 
    authMiddleware(), 
    validateRequest(ExpenseUpdateValidationSchema),
    async (req, res) => {
      const entity_id = req.body.entity_id ?? req.user!.id;
      const xid = parseInt(req.params.id);
      const { description, category_id, amount, spent_at } = req.body;
      const result = await SQL_UPDATE_EXPENSE({
        description, category_id, amount, spent_at, entity_id, xid
      }).one(new HttpError(404));
      res.json(result);
    });
};