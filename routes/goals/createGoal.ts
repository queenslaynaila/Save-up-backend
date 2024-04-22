import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import { CreateGoalInterface, GoalInterface, baseGoalSchema } from '../../types';

const SQL_CREATE_GOAL = sql<CreateGoalInterface, GoalInterface>(`
  INSERT INTO goals (entity_id, name, category_id, amount, priority, target_at)
  VALUES (:entity_id, :name, :category_id, :amount, :priority, :target_at )
  RETURNING id, entity_id, name, category_id, amount, priority, target_at, created_at, completed_at;
`);

const goalSchema = baseGoalSchema.omit({ entity_id: true })

export default (router: Router) => {
  router.post<Record<string,never>,GoalInterface,CreateGoalInterface,Record<string,never>,Record<string,never>>(
    '/', 
    authMiddleware(), 
    validateRequest(goalSchema),
    async (req, res) => {
      const { name, category_id, amount, priority, target_at, entity_id } = req.body;
      const newGoal = await SQL_CREATE_GOAL({
        name,
        category_id,
        amount,
        priority,
        target_at,
        entity_id
      }).one();
      return res.json(newGoal);
    });
};
