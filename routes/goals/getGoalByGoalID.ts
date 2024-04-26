import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { GoalInterface } from './types';
import { IdParamInterface, IdInterface } from '../../globalTypes/index';

const SQL_GET_GOAL_BY_ID = sql<IdInterface, GoalInterface>(`
  SELECT g.id, g.name, g.entity_id, g.category_id, g.amount, g.priority, g.target_at,
    g.created_at, g.completed_at, g.updated_at, g.goal_type, ir.rate AS interest_rate
  FROM goals g
  LEFT JOIN interest_rates ir ON g.goal_type = ir.type
  WHERE g.id = :id  
  AND g.deleted_at IS NULL;
`);

export default (router: Router) => {
  router.get<IdParamInterface, GoalInterface, Record<string,never>, Record<string,never>>(
    '/records/:id', 
    authMiddleware(), 
    async (req, res) => {
      const goalId = (parseInt(req.params.id));
      const query = SQL_GET_GOAL_BY_ID({ id: goalId });
      const goal = await query.one(new HttpError(404, 'Not found'));
      return res.json(goal);
    });
};
