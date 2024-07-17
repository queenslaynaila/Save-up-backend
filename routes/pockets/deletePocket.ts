import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { 
  EntityInterface, 
  entitySchema, 
  IdParamInterface, 
  idParamSchema, 
  StatusCodeInterface 
} from '../../globalTypes/index'
import validateRequest from '../../middleware/validationMiddleware';

const SQL_DELETE_POCKET = sql<{pocket_id: number, entity_id: number}, Record<string,never>>(`
  SELECT delete_pocket(:pocket_id, :entity_id)
`);

export default (router: Router) => {
  router.delete<IdParamInterface, StatusCodeInterface, EntityInterface, 
  Record<string,never>>(
    '/:id', 
    validateRequest({ 
      params:idParamSchema,  
      body: entitySchema  
    }),
    authMiddleware(), 
    async (req, res) => {
      const entity_id = req.body?.entity_id ?? req.user!.id;
      await SQL_DELETE_POCKET({ 
        pocket_id:parseInt(req.params.id), 
        entity_id
      }).exec();
      res.sendStatus(204);
    });
};