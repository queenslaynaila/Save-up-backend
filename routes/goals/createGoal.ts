import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import { CreateGoalInterface, GoalInterface, baseGoalSchema } from '../../types';

const SQL_CREATE_GOAL = sql<CreateGoalInterface, GoalInterface>(`
  INSERT INTO goals (id, entity_id, description, category_id, amount, priority, target_at)
  VALUES (
    COALESCE((SELECT MAX(id) FROM goals WHERE entity_id = :entity_id), 0) + 1,
    :entity_id, :description, :category_id, :amount, :priority, :target_at )
  RETURNING id, entity_id, description, category_id, amount, priority, target_at, created_at, completed_at;
`);

const goalSchema = baseGoalSchema.omit({ entity_id: true })

export default (router: Router) => {
  router.post<Record<string,never>,GoalInterface,CreateGoalInterface,Record<string,never>,Record<string,never>>(
    '/', 
    authMiddleware(), 
    validateRequest(goalSchema),
    async (req, res) => {
      const { description, category_id, amount, priority, target_at, entity_id } = req.body;
      const newGoal = await SQL_CREATE_GOAL({
        description,
        category_id,
        amount,
        priority,
        target_at,
        entity_id
      }).one();
      return res.json(newGoal);
    });
};
