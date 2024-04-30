import { Router } from 'express';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';
import { UpdatePocketInterface,  PocketUpdateRes, UpdatePocketRequestSchema } from './types';
import { IdParamInterface } from '../../globalTypes/index';
import { validateRequest } from '../../middleware/validationMiddleware';

const SQL_UPDATE_POCKET = sql<UpdatePocketInterface, PocketUpdateRes>(`
  UPDATE pockets
  SET name = COALESCE(:name, pockets.name),
      category_id = COALESCE(:category_id, pockets.category_id),
      target_amount = COALESCE(:target_amount, pockets.target_amount),
      priority = COALESCE(:priority, pockets.priority),
      target_at = COALESCE(:target_at, pockets.target_at)
  WHERE id = :id 
  RETURNING name, category_id, target_amount, priority, target_at
`);

export default (router: Router) => {
  router.patch<IdParamInterface, PocketUpdateRes, UpdatePocketInterface, Record<string,never>>(
    '/:id', 
    authMiddleware(), 
    validateRequest(UpdatePocketRequestSchema),
    async (req, res) => {
      const pocketId = parseInt(req.params.id);
      const { name, category_id, target_amount, priority, target_at } = req.body;
      const goal = await SQL_UPDATE_POCKET({
        id: pocketId,
        name,
        category_id,
        target_amount,
        priority,
        target_at,
      })
        .one(new HttpError(404, 'Not found'));
      return res.json(goal);
    });
};
