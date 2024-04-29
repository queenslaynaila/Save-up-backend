import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import { CreateGoalInterface, GoalInterface, baseGoalSchema } from './types';

const SQL_CREATE_POCKET = sql<CreateGoalInterface, GoalInterface>(`
  INSERT INTO goals (entity_id, category_id, name, target_amount, priority, target_at, goal_type)
  VALUES (:entity_id, :category_id, :name, :target_amount, :priority, :target_at, :goal_type) )
  RETURNING id, entity_id, name, category_id, target_amount, priority, target_at, created_at, completed_at;
`);

const goalSchema = baseGoalSchema.omit({ entity_id: true })

export default (router: Router) => {
  router.post<Record<string,never>, GoalInterface, CreateGoalInterface, Record<string,never>, Record<string,never>>(
    '/', 
    authMiddleware(), 
    validateRequest(goalSchema),
    async (req, res) => {
      const { entity_id, category_id, name, target_amount, priority, target_at, goal_type } = req.body;
      const newGoal = await SQL_CREATE_POCKET({
        entity_id,
        category_id,
        name,
        target_amount,
        priority,
        target_at,
        goal_type
      }).one();
      return res.json(newGoal);
    });
};
