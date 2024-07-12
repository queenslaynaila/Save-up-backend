import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import validateRequest from '../../middleware/validationMiddleware';
import { PocketCreateType, BasePocketType, basePocketSchema   } from './types';
import { headersSchema } from '../../globalTypes';

const SQL_CREATE_POCKET = sql<PocketCreateType, BasePocketType>(`
  INSERT INTO pockets (entity_id, xid, category_id, name, priority, pocket_type, target_amount, target_at)
  SELECT :entity_id,
          COALESCE(MAX(xid), 0) + 1,
          :category_id,
          :name,
          :priority,
          :pocket_type,
          :target_amount,
          :target_at
  FROM pockets 
  WHERE entity_id = :entity_id
  RETURNING entity_id, 
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
`);

export default (router: Router) => {
  router.post<Record<string,never>, BasePocketType, BasePocketType,
  Record<string,never>>(
    '/', 
    validateRequest({ headers: headersSchema, body: basePocketSchema }),
    authMiddleware(), 
    async (req, res) => {
      const entity_id = req.body?.entity_id ?? req.user!.id;
      const newPocket = await SQL_CREATE_POCKET({...req.body, entity_id}).one();
      return res.json(newPocket);
    });
};