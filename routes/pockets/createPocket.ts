import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import { CreatePocketInterface, PocketInterface, basePocketSchema } from './types';

const SQL_CREATE_POCKET = sql<CreatePocketInterface, PocketInterface>(`
  INSERT INTO pockets (entity_id, category_id, name, target_amount, priority, target_at, pocket_type)
  VALUES (:entityId, :categoryId, :name, :targetAmount, :priority, :targetAt, :pocketType) )
  RETURNING id, entity_id, name, category_id, target_amount, priority, target_at, created_at, completed_at;
`);

const pocketSchema = basePocketSchema.omit({ entityId: true })

export default (router: Router) => {
  router.post<Record<string,never>, PocketInterface, CreatePocketInterface, Record<string,never>, Record<string,never>>(
    '/', 
    authMiddleware(), 
    validateRequest(pocketSchema),
    async (req, res) => {
      const { entityId, categoryId, name, targetAmount, priority, targetAt, pocketType } = req.body;
      const newPocket = await SQL_CREATE_POCKET({
        entityId,
        categoryId,
        name,
        targetAmount,
        priority,
        targetAt,
        pocketType
      }).one();
      return res.json(newPocket);
    });
};
