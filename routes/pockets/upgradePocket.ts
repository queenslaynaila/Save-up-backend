import { Router } from 'express';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';
import { UpgradeGoalSubset, GoalInterface, upgradeGoalSchema } from './types';
import { IdParamInterface} from '../../globalTypes/index';
import { validateRequest } from '../../middleware/validationMiddleware';

const SQL_UPGRADE_POCKET = sql<UpgradeGoalSubset, GoalInterface>(`
  UPDATE pockets p
  SET pocket_type = :pocket_type,
      target_at = COALESCE(:target_at, target_at)
  FROM pockets p
  LEFT JOIN interest_rates ir ON p.pocket_type = ir.type
  WHERE p.id = :id 
  RETURNING p.id, p.name, p.entity_id, p.category_id, p.target_amount, p.priority, p.target_at,
  p.created_at, p.completed_at, p.updated_at, p.pocket_type, ir.rate AS interest_rate;
`);

export default (router: Router) => {
  router.patch<IdParamInterface, GoalInterface, UpgradeGoalSubset, Record<string,never>>(
    '/:id', 
    authMiddleware(), 
    validateRequest(upgradeGoalSchema),
    async (req, res) => {
      const pocketId = parseInt(req.params.id);
      const { target_at } = req.body;
      const pocket_type = 'Locked Pocket';
      const goal = await SQL_UPGRADE_POCKET({
        id: pocketId,
        target_at,
        pocket_type
      }).one(new HttpError(404, 'Not found'));
      return res.json(goal);
    });
};
