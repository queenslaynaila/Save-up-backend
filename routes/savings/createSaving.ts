import authMiddleware from '../../middleware/auth';
import { hasPermission } from '../../middleware/hasPermission';
import { Router } from 'express';
import { savingSchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';
import { savingInterface } from './index';

export default (router: Router) => {
  router.post('/', authMiddleware(), async (req, res) => {
    const validationResult = savingSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new HttpError(400, 'Invalid saving data');
    }
    const { user_id, description, category_id, target_amount, priority, target_date } = validationResult.data;
    const userId = req.user!.id;
    const loggedInUserRole = req.user!.role;
    if (!hasPermission(req, userId,  loggedInUserRole)) {
      throw new HttpError(403, 'Unauthorized access');
    }

    const query = `
      INSERT INTO savings (user_id, description, category_id, target_amount, priority, target_date, created_at, updated_at)
      VALUES (:user_id, :description, :category_id, :target_amount, :priority, :target_date, NOW(), NOW()) 
      RETURNING *
    `;
    const SQL_CREATE_SAVING = sql<{ user_id: string; description: string; category_id: string; target_amount: number; priority: string; target_date: string }, savingInterface>(query);

    const newSaving = await SQL_CREATE_SAVING({
      user_id,
      description,
      category_id,
      target_amount,
      priority,
      target_date,
    }).one();
    res.json(newSaving);
  });
};
