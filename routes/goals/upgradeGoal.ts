import { Router } from 'express';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';
import { UpgradeGoalSubset, GoalInterface, upgradeGoalSchema} from '../../types';
import { validateRequest } from '../../middleware/validationMiddleware';

const SQL_UPGRADE_GOAL = sql<UpgradeGoalSubset, GoalInterface>(`
    UPDATE goals g
    SET goal_type = 'Locked Goals',
        target_at = COALESCE(:target_at, target_at)
    FROM goals g
    LEFT JOIN interest_rates ir ON g.goal_type = ir.type
    WHERE g.id = :id 
    RETURNING g.id, g.name, g.entity_id, g.category_id, g.target_amount, g.priority, g.target_at,
    g.created_at, g.completed_at, g.updated_at, g.goal_type, ir.rate AS interest_rate;
`);

export default (router: Router) => {
  router.patch<{ id: string }, GoalInterface,UpgradeGoalSubset, Record<string,never>>(
    '/:id', 
    authMiddleware(), 
    validateRequest(upgradeGoalSchema),
    async (req, res) => {
      const goalId = parseInt(req.params.id);
      const { target_at } = req.body;
      const goal = await SQL_UPGRADE_GOAL({
        id: goalId,
        target_at,
      }).one(new HttpError(404, 'Not found'));
      return res.json(goal);
    });
};
