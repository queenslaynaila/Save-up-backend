import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { 
  IdParamInterface, 
  XidEntityInterface, 
  StatusCodeInterface, 
  idParamSchema,
  entitySchema,
  EntityInterface
} from '../../globalTypes/index'
import validateRequest from '../../middleware/validationMiddleware';

const SQL_DELETE_EXPENSE = sql<XidEntityInterface, Record<string,never>>(`
  UPDATE expenses
  SET deleted_at = NOW()
  WHERE xid = :xid
  AND entity_id = :entity_id
  AND deleted_at IS NULL
`);

export default (router: Router) => {
  router.delete<IdParamInterface, StatusCodeInterface, EntityInterface, 
  Record<string,never>>(
    '/:id', 
    validateRequest({
      params: idParamSchema,
      body:entitySchema
    }),
    authMiddleware(), 
    async (req, res) => {
      const entity_id =  req.body?.entity_id ?? req.user!.id;
      await SQL_DELETE_EXPENSE({
        xid: parseInt(req.params.id), entity_id
      }).exec();
      res.sendStatus(204);
    });
};