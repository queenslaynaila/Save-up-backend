import { Router } from 'express';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';
import { UpgradeGoalSubset, GoalInterface, upgradeGoalSchema } from './types';
import { IdParamInterface} from '../../globalTypes/index';
import { validateRequest } from '../../middleware/validationMiddleware';

const SQL_UPGRADE_POCKET = sql<UpgradeGoalSubset, GoalInterface>(`
  UPDATE goals g
  SET goal_type = :goal_type,
      target_at = COALESCE(:target_at, target_at)
  FROM goals g
  LEFT JOIN interest_rates ir ON g.goal_type = ir.type
  WHERE g.id = :id 
  RETURNING g.id, g.name, g.entity_id, g.category_id, g.target_amount, g.priority, g.target_at,
  g.created_at, g.completed_at, g.updated_at, g.goal_type, ir.rate AS interest_rate;
`);

export default (router: Router) => {
  router.patch<IdParamInterface, GoalInterface, UpgradeGoalSubset, Record<string,never>>(
    '/:id', 
    authMiddleware(), 
    validateRequest(upgradeGoalSchema),
    async (req, res) => {
      const goalId = parseInt(req.params.id);
      const { target_at } = req.body;
      const goal_type = 'Locked Goal';
      const goal = await SQL_UPGRADE_POCKET({
        id: goalId,
        target_at,
        goal_type
      }).one(new HttpError(404, 'Not found'));
      return res.json(goal);
    });
};
