import { Router } from 'express';
import authMiddleware from '../../middleware/auth';
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

    const loggedInUserId = req.user!.id;
    const authenticatedUserId = req.user?.id;

    if (authenticatedUserId !== user_id) {
      throw new HttpError(403, 'Unauthorized');
    }

    const query = `
      INSERT INTO savings (user_id, description, category_id, target_amount, priority, target_date, created_at, updated_at)
      VALUES (:user_id, :description, :category_id, :target_amount, :priority, :target_date, NOW(), NOW()) 
      RETURNING *
    `;

    const SQL_CREATE_SAVING = sql<typeof validationResult.data, savingInterface>(query);

    const newSaving = await SQL_CREATE_SAVING({
      user_id: loggedInUserId,
      description,
      category_id,
      target_amount,
      priority,
      target_date,
    }).one().catch(() => {
      throw new HttpError(400, 'Selected category doessnt exist');
    });

    res.json(newSaving);
  });
};
