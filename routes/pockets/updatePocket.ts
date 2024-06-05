import { Router } from 'express';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';
import { UpdatePocketInterface,  PocketUpdateRes, basePocketSchema} from './types';
import { IdParamInterface } from '../../globalTypes/index';
import { validateRequest } from '../../middleware/validationMiddleware';

const SQL_UPDATE_POCKET = sql<UpdatePocketInterface, PocketUpdateRes>(`
  UPDATE pockets
  SET name = COALESCE(:name, name),
      category_id = COALESCE(:category_id, category_id),
      target_amount = COALESCE(:target_amount, target_amount),
      priority = COALESCE(:priority, priority),
      pocket_type = COALESCE(:pocket_type, pocket_type),
      target_at = COALESCE(:target_at, target_at)
  WHERE entity_id = :entity_id
  AND xid = :xid
  RETURNING name, 
            category_id, 
            (SELECT name FROM categories WHERE id = pockets.category_id) AS category_name,
            target_amount, 
            priority, 
            pocket_type, 
            target_at
`);

export default (router: Router) => {
  router.patch<IdParamInterface, PocketUpdateRes, UpdatePocketInterface, Record<string,never>>(
    '/:id', 
    authMiddleware(), 
    validateRequest(basePocketSchema),
    async (req, res) => {
      const entity_id = req.body.entity_id ?? req.user!.id;
      const goal = await SQL_UPDATE_POCKET({ ...req.body, entity_id, xid:parseInt(req.params.id)})
        .one(new HttpError(404, 'Not found'));
      return res.json(goal);
    });
};
