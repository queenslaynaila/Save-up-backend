import { Router } from 'express';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';
import { UpdateGoalInterface, GoalInterface, UpdateGoalRequestSchema} from '../../types';
import { validateRequest } from '../../middleware/validationMiddleware';

const SQL_UPDATE_SAVING = sql<UpdateGoalInterface, GoalInterface>(`
  UPDATE goals
  SET name = COALESCE(:name, goals.name),
      category_id = COALESCE(:category_id, goals.category_id),
      amount = COALESCE(:amount, goals.amount),
      priority = COALESCE(:priority, goals.priority),
      target_at = COALESCE(:target_at, goals.target_at)
  WHERE id = :id 
  RETURNING *
`);

export default (router: Router) => {
  router.patch<{ id: string }, GoalInterface, UpdateGoalInterface, Record<string,never>>(
    '/:id', 
    authMiddleware(), 
    validateRequest(UpdateGoalRequestSchema),
    async (req, res) => {
      const savingId = parseInt(req.params.id);
      const { name, category_id, amount, priority, target_at } = req.body;
      const result = await SQL_UPDATE_SAVING({
        id: savingId,
        name: name,
        category_id: category_id,
        amount: amount,
        priority: priority,
        target_at: target_at,
      })
        .one(new HttpError(404, 'Not found'));
      return res.json(result);
    });
};
