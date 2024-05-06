import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import { CreatePocketInterface, PocketInterface, basePocketSchema } from './types';

const SQL_CREATE_POCKET = sql<CreatePocketInterface, PocketInterface>(`
  INSERT INTO pockets (id, entity_id, category_id, name, target_amount, priority, target_at, pocket_type)
  VALUES ((SELECT COALESCE(MAX(id), 0) + 1 FROM pockets WHERE entity_id = :entity_id), 
          :entity_id, :category_id, :name, :target_amount, :priority, :target_at, :pocket_type)
  RETURNING id, entity_id, name, category_id, target_amount, priority, target_at, created_at, completed_at;
`);


export default (router: Router) => {
  router.post<Record<string,never>, PocketInterface, CreatePocketInterface, Record<string,never>, Record<string,never>>(
    '/', 
    authMiddleware(), 
    validateRequest(basePocketSchema),
    async (req, res) => {
      const { entity_id, category_id, name, target_amount, priority, target_at, pocket_type } = req.body;
      const newPocket = await SQL_CREATE_POCKET({
        entity_id,
        category_id,
        name,
        target_amount,
        priority,
        target_at,
        pocket_type
      }).one();
      return res.json(newPocket);
    });
};
