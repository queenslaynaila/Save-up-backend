import { Router } from 'express';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';
import { PocketUpdateType, pocketPatchRequestSchema, BasePocketType} from './types';
import { IdParamInterface } from '../../globalTypes/index';
import { validateRequest } from '../../middleware/validationMiddleware';

const SQL_UPDATE_POCKET = sql<PocketUpdateType, BasePocketType>(`
  UPDATE pockets
  SET name = COALESCE(:name, name),
      category_id = COALESCE(:category_id, category_id),
      target_amount = COALESCE(:target_amount, target_amount),
      priority = COALESCE(:priority, priority),
      pocket_type = COALESCE(:pocket_type, pocket_type),
      target_at = COALESCE(:target_at, target_at)
  WHERE entity_id = :entity_id
  AND xid = :xid
  AND deleted_at IS NULL
  RETURNING name, 
            category_id, 
            (SELECT name FROM categories WHERE id = pockets.category_id) AS category_name,
            target_amount, 
            priority, 
            pocket_type, 
            target_at
`);

export default (router: Router) => {
  router.patch<IdParamInterface, BasePocketType, PocketUpdateType, Record<string,never>>(
    '/:id', 
    authMiddleware(), 
    validateRequest(pocketPatchRequestSchema),
    async (req, res) => {
      const entity_id = req.body.entity_id ?? req.user!.id;
      const { name, category_id, target_amount, priority, target_at, pocket_type } = req.body;      
      const goal = await SQL_UPDATE_POCKET({
        xid: parseInt(req.params.id),
        entity_id,
        name,
        category_id,
        target_amount,
        priority,
        target_at,
        pocket_type
      })
        .one(new HttpError(404, 'Not found'));
      return res.json(goal);
    });
};
