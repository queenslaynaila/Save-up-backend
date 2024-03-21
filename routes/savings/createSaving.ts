import { Router } from 'express';
import { z } from 'zod';
import authMiddleware from '../../middleware/auth';
import { savingSchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';
import { savingInterface } from './index';
import { hasPermission } from '../../middleware/hasPermission';

const SQL_CREATE_SAVING = sql<z.infer<typeof savingSchema>, savingInterface>(`
  INSERT INTO savings (user_id, description, category_id, amount, priority, target_date)
  VALUES (:user_id, :description, :category_id, :amount, :priority, :target_date) 
  RETURNING *
`);

export default (router: Router) => {
  router.post<Record<string, never>,savingInterface,typeof savingSchema,Record<string, never>,Record<string, never>>(
    '/', 
    authMiddleware(), 
    async (req, res) => {
      const validationResult = savingSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw new HttpError(400, 'Invalid saving data');
      }
      const { user_id, description, category_id, amount, priority, target_date } =validationResult.data;
      if (!hasPermission(req, user_id)) {
        throw new HttpError(403, 'Unauthorized');
      }
      const newSaving = await SQL_CREATE_SAVING({
        user_id: user_id,
        description,
        category_id,
        amount,
        priority,
        target_date,
      }).one(new HttpError(400, 'Selected category does not exist'))
      return res.json(newSaving);
    });
};
