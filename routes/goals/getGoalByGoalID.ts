import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';
import { validateRequest } from '../../middleware/validationMiddleware';
import { HttpError } from '../../middleware/errorMiddleware';
import { ID_SCHEMA, GoalInterface } from '../../types';

const SQL_GET_SAVING_BY_ID = sql<{ id: number;}, GoalInterface>(`
    SELECT id, entity_id, description, category_id, amount, priority, target_at ,created_at,completed_at FROM goals
    WHERE id = :id
`);

export default (router: Router) => {
  router.get<{ savingId: string }, GoalInterface, Record<string, never>, Record<string, never>>(
    '/records/:savingId', 
    authMiddleware(), 
    validateRequest(ID_SCHEMA),
    async (req, res) => {
      const savingId = (parseInt(req.params.savingId));
      const query = SQL_GET_SAVING_BY_ID({ id: savingId });
      const saving = await query.one(new HttpError(404, 'Not found'));
      return res.json(saving);
    });
};
