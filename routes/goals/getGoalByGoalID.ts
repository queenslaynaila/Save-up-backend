import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { GoalInterface,IdParamInterface } from '../../types';

const SQL_GET_GOAL_BY_ID = sql<{ id: number}, GoalInterface>(`
    SELECT id, entity_id, description, category_id, amount, priority, target_at ,created_at,completed_at FROM goals
    WHERE id = :id
`);

export default (router: Router) => {
  router.get<IdParamInterface, GoalInterface, Record<string,never>, Record<string,never>>(
    '/records/:id', 
    authMiddleware(), 
    async (req, res) => {
      const goalId = (parseInt(req.params.id));
      const query = SQL_GET_GOAL_BY_ID({ id: goalId });
      const saving = await query.one(new HttpError(404, 'Not found'));
      return res.json(saving);
    });
};
