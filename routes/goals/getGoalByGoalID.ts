import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { GoalInterface } from '../../types';

const SQL_GET_SAVING_BY_ID = sql<{ id: number}, GoalInterface>(`
    SELECT id, entity_id, description, category_id, amount, priority, target_at ,created_at,completed_at FROM goals
    WHERE id = :id
`);

export default (router: Router) => {
  router.get<{ goalId: string }, GoalInterface, Record<string,never>, Record<string,never>>(
    '/records/:goalId', 
    authMiddleware(), 
    async (req, res) => {
      const savingId = (parseInt(req.params.goalId));
      const query = SQL_GET_SAVING_BY_ID({ id: savingId });
      const saving = await query.one(new HttpError(404, 'Not found'));
      return res.json(saving);
    });
};
