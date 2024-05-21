import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import { CreatePocketInterface, PocketInterface, createPocketSchema } from './types';

const SQL_CREATE_POCKET = sql<CreatePocketInterface, PocketInterface>(`
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
  GROUP BY entity_id
  RETURNING xid, entity_id, name, category_id, target_amount, priority, target_at, created_at;
`);

export default (router: Router) => {
  router.post<Record<string,never>, PocketInterface, CreatePocketInterface, Record<string,never>, Record<string,never>>(
    '/', 
    authMiddleware(), 
    validateRequest(createPocketSchema),
    async (req, res) => {
      const { category_id, name, target_amount, priority, target_at, pocket_type } = req.body;
      const entity_id = req.body.entity_id ? req.body.entity_id : req.user!.id;
      console.log(entity_id)
      const newPocket = await SQL_CREATE_POCKET({
        entity_id,
        category_id,
        name,
        priority,
        pocket_type,
        target_amount,
        target_at,
      }).one();
      return res.json(newPocket);
    });
};
