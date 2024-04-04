import { Router } from 'express';
import authMiddleware from '../../middleware/auth';
import { sql } from '../../db';
import {CreateGroupGoalInterface ,CreateGroupGoalSchema ,CreateGroupGoalResponse ,} from '../../types';
import { validateRequest } from '../../middleware/validationMiddleware';


const SQL_CREATE_SAVING = sql<CreateGroupGoalInterface, typeof CreateGroupGoalResponse >(`
  INSERT INTO savings (id, owner_id, owner_type, category_id, description, target_amount, priority, target_at)
  SELECT COALESCE((SELECT MAX(id) FROM savings WHERE owner_id = :group_id), 0) + 1,
  :group_id, 'Group', :category_id, :description, :target_amount, :priority, :target_at
  RETURNING *
`);


export default (router: Router) => {
  router.post<Record<string, never>,typeof CreateGroupGoalResponse , CreateGroupGoalInterface, Record<string, never>, Record<string, never>>(
    '/create-group-goal',
    authMiddleware(),
    validateRequest(CreateGroupGoalSchema),
    async (req, res) => {
      const { group_id, description, category_id, target_amount, priority, target_at } = req.body;
      const newSaving = await SQL_CREATE_SAVING({
        group_id,
        category_id,
        description,
        target_amount,
        priority,
        target_at,
      }).one();
      return res.json(newSaving);
    });
};
