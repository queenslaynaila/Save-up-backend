import { Router } from 'express';
import { z } from 'zod';
import authMiddleware from '../../middleware/auth';
import { savingSchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';
import { savingInterface } from './index';
import { hasPermission } from '../../middleware/hasPermission';

const SQL_CREATE_SAVING = sql<z.infer<typeof savingSchema>, savingInterface>(`
  INSERT INTO savings (id, user_id, description, category_id, amount, priority, target_at)
  SELECT COALESCE((SELECT MAX(id) FROM savings WHERE user_id = :user_id), 0) + 1,
  :user_id, :description, :category_id, :amount, :priority, :target_at
  RETURNING *
`);

export default (router: Router) => {
  router.post<Record<string, never>,savingInterface,typeof savingSchema,Record<string, never>,Record<string, never>>(
    '/', 
    authMiddleware(), 
    async (req, res) => {
      const validationResult = savingSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw new HttpError(400, 'Invalid request');
      }
      const { user_id, description, category_id, amount, priority, target_at } =validationResult.data;
      if (!hasPermission(req, user_id)) {
        throw new HttpError(403, 'Unauthorized');
      }
      const newSaving = await SQL_CREATE_SAVING({
        user_id: user_id,
        description,
        category_id,
        amount,
        priority,
        target_at,
      }).one(new HttpError(400, 'Failed to create saving. Please try again later'))
      return res.json(newSaving);
    });
};
