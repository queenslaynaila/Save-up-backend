import { Router } from 'express';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';
import { UpgradePocketSubset, upgradePocketSchema, upgradedPocketInterface } from './types';
import { IdParamInterface} from '../../globalTypes/index';
import { validateRequest } from '../../middleware/validationMiddleware';

const SQL_UPGRADE_POCKET = sql<UpgradePocketSubset, upgradedPocketInterface>(`
  UPDATE pockets p
  SET pocket_type = :pocket_type,
      target_at = COALESCE(:target_at, p.target_at)
  FROM interest_rates ir
  WHERE p.pocket_type = ir.pocket_type AND p.id = :id 
  RETURNING p.pocket_type, ir.rate AS interest_rate, p.target_at;
`);

export default (router: Router) => {
  router.patch<IdParamInterface, upgradedPocketInterface, UpgradePocketSubset, Record<string,never>>(
    '/upgrade/:id', 
    authMiddleware(), 
    validateRequest(upgradePocketSchema),
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
