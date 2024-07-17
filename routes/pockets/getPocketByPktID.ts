import { Router } from 'express';
import { sql } from '../../db';
import validateRequest from '../../middleware/validationMiddleware';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { BasePocketType} from './types';
import { 
  IdParamInterface, 
  XidEntityInterface,
  entitySchema,
  idParamSchema 
} from '../../globalTypes';

const SQL_GET_POCKET_BY_ID = sql<XidEntityInterface, BasePocketType>(`
  SELECT entity_id, 
         xid, 
         category_id, 
         name, 
         priority, 
         status, 
         pocket_type, 
         target_amount,  
         target_at, 
         created_at, 
         completed_at
  FROM pockets  
  WHERE  entity_id = :entity_id
  AND xid = :xid
  AND deleted_at IS NULL
`);

export default (router: Router) => {
  router.get<IdParamInterface, BasePocketType, Record<string,never>, Record<string,never>>(
    '/:id', 
    validateRequest({ 
      params:  idParamSchema,
      body: entitySchema
    }),
    authMiddleware(), 
    async (req, res) => {
      const entity_id = req.body?.entity_id ?? req.user!.id;
      const pocket = await SQL_GET_POCKET_BY_ID({ 
        xid:parseInt(req.params.id), 
        entity_id 
      }).one(new HttpError(404));
      return res.json(pocket);
    });
};