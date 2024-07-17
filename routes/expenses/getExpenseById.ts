import { Router } from 'express';
import { sql } from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/authorization';
import { BaseExpenseInterface } from './types';
import { 
  EntityInterface,
  entitySchema,
  IdParamInterface, 
  idParamSchema, 
  XidEntityInterface 
} from '../../globalTypes/index'
import validateRequest from '../../middleware/validationMiddleware';

const SQL_GET_EXPENSE_BY_ID = sql<XidEntityInterface,  BaseExpenseInterface>(`
  SELECT xid, entity_id, category_id, description, amount, spent_at, created_at
  FROM expenses 
  WHERE xid = :xid 
  AND entity_id = :entity_id
  AND deleted_at IS NULL
`);

export default (router: Router) => {
  router.get<IdParamInterface, BaseExpenseInterface, EntityInterface, 
  Record<string,never>>(
    '/:id', 
    validateRequest({
      params: idParamSchema,
      body:entitySchema
    }),
    authMiddleware(), 
    async (req, res) => {
      const entity_id = req.body?.entity_id ?? req.user!.id;
      const result = await SQL_GET_EXPENSE_BY_ID({ 
        xid:parseInt(req.params.id), 
        entity_id 
      }).one(new HttpError(404));
      return res.json(result);
    });
};