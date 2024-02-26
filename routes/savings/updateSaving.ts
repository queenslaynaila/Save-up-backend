import { Router } from 'express';
import { HttpError } from '../../middleware/errorMiddleware';
import { idSchema, updateSavingSchema } from '../../types';
import authMiddleware from '../../middleware/auth';
import { sql } from '../../db';

export default (router: Router) => {
  router.patch('/:id', authMiddleware(), async (req, res) => {
    const savingId = req.params.id;
    const validationResult = idSchema.safeParse(savingId);
    if (!validationResult.success) {
      return res.status(400).json({ error: new HttpError(400, 'Invalid saving ID').message });
    }
    const userId = req.user!.id;

    const validatedSavings = updateSavingSchema.safeParse(req.body);
    if (!validatedSavings.success) {
      throw new HttpError(422, 'Invalid saving data');
    }
    const { description, target_amount, priority, target_date } = validatedSavings.data;

    let query = 'UPDATE savings SET ';
    const values = [];
    if (description) {
      query += `description = :description, `;
      values.push(description);
    }

    if (target_amount) {
      query += `target_amount = :target_amount, `;
      values.push(target_amount);
    }
    if (priority) {
      query += `priority = :priority, `;
      values.push(priority);
    }
    if (target_date) {
      query += `target_date = :target_date, `;
      values.push(target_date);
    }
    query = query.slice(0, -2);
    query += ' WHERE user_id = :user_id AND id = :saving_id RETURNING *';
    values.push(userId, savingId);

    const SQL_UPDATE_SAVING = sql<{ description?: string; target_amount?: number; priority?: string; target_date?: string; user_id: string; saving_id: string }, Record<string, never>>(query);
    const result = await SQL_UPDATE_SAVING({ description, target_amount, priority, target_date, user_id: userId, saving_id: savingId }).one();

    return res.json(result);
  });
};
