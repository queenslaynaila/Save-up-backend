import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { GoalInterface } from './types';
import { IdParamInterface, IdInterface } from '../../globalTypes/index';

const SQL_GET_POCKET_BY_ID = sql<IdInterface, GoalInterface>(`
  SELECT p.id, p.name, p.entity_id, p.category_id, p.amount, p.priority, p.target_at,
    p.created_at, p.completed_at, p.updated_at, p.pocket_type, ir.rate AS interest_rate
  FROM pockets p
  LEFT JOIN interest_rates ir ON p.pocket_type = ir.type
  WHERE p.id = :id  
  AND p.deleted_at IS NULL;
`);

export default (router: Router) => {
  router.get<IdParamInterface, GoalInterface, Record<string,never>, Record<string,never>>(
    '/records/:id', 
    authMiddleware(), 
    async (req, res) => {
      const pocketId = (parseInt(req.params.id));
      const query = SQL_GET_POCKET_BY_ID({ id: pocketId });
      const pocket = await query.one(new HttpError(404, 'Not found'));
      return res.json(pocket);
    });
};
