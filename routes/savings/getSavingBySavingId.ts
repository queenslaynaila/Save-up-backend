import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { BaseSavingType } from './types';
import { 
  EntityInterface, 
  entitySchema, 
  IdParamInterface,  
  idParamSchema,  
  XidEntityInterface 
} from '../../globalTypes';
import validateRequest from '../../middleware/validationMiddleware';

const  SQL_GET_DEPOSIT_BY_ID = sql<XidEntityInterface, BaseSavingType>(`
  SELECT pocket_id, delta AS amount, created_at 
  FROM transactions
  WHERE xid = :xid 
  AND entity_id = :entity_id
`);

export default (router: Router) => {
  router.get<IdParamInterface, BaseSavingType, EntityInterface, Record<string,never>>(
    '/:id', 
    validateRequest({ 
      params: idParamSchema,
      body: entitySchema
    }),
    authMiddleware(), 
    async (req, res) => {
      const entity_id = req.body?.entity_id ?? req.user!.id;
      const result = await SQL_GET_DEPOSIT_BY_ID({ 
        xid:parseInt(req.params.id), 
        entity_id 
      }).one(new HttpError(404));
      return res.json(result);
    });
};