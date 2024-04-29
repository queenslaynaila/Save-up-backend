import { Router } from 'express';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';
import { UpdateGoalInterface,  GoalUpdateRes, UpdateGoalRequestSchema } from './types';
import { IdParamInterface } from '../../globalTypes/index';
import { validateRequest } from '../../middleware/validationMiddleware';

const SQL_UPDATE_POCKET = sql<UpdateGoalInterface, GoalUpdateRes>(`
  UPDATE goals
  SET name = COALESCE(:name, goals.name),
      category_id = COALESCE(:category_id, goals.category_id),
      target_amount = COALESCE(:target_amount, goals.target_amount),
      priority = COALESCE(:priority, goals.priority),
      target_at = COALESCE(:target_at, goals.target_at)
  WHERE id = :id 
  RETURNING name, category_id, target_amount, priority, target_at
`);

export default (router: Router) => {
  router.patch<IdParamInterface, GoalUpdateRes, UpdateGoalInterface, Record<string,never>>(
    '/:id', 
    authMiddleware(), 
    validateRequest(UpdateGoalRequestSchema),
    async (req, res) => {
      const goalId = parseInt(req.params.id);
      const { name, category_id, target_amount, priority, target_at } = req.body;
      const goal = await SQL_UPDATE_POCKET({
        id: goalId,
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
