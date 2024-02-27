import { Router } from 'express';
import { z } from 'zod';
import authMiddleware from '../../middleware/auth';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';
import { savingInterface } from './index';
import { updateSavingSchema } from '../../types';

let query = 'UPDATE savings SET ';
const SQL_UPDATE_SAVING = sql<z.infer<typeof updateSavingSchema>,savingInterface>(query);

export default (router: Router) => {
  router.patch('/:id', authMiddleware(), async (req, res) => {
    const savingId = req.params.id;
    const userId = req.user!.id;

    const validatedSavings = updateSavingSchema.safeParse(req.body);
    if (!validatedSavings.success) {
      throw new HttpError(422, 'Invalid saving data');
    }

    const { description, category_id, target_amount, priority, target_date } = validatedSavings.data;

    const values: z.infer<typeof updateSavingSchema>&{ user_id: string; saving_id: string } = { user_id: userId, saving_id: savingId };

    if (description) {
      query += `description = :description, `;
      values.description = description;
    }
    if (category_id) {
      query += `category_id = :category_id, `;
      values.category_id = category_id;
    }
    if (target_amount) {
      query += `target_amount = :target_amount, `;
      values.target_amount = target_amount;
    }
    if (priority) {
      query += `priority = :priority, `;
      values.priority = priority;
    }
    if (target_date) {
      query += `target_date = :target_date, `;
      values.target_date = target_date;
    }

    query = query.slice(0, -2);
    query += ' WHERE user_id = :user_id AND id = :saving_id RETURNING *';
    const result = await SQL_UPDATE_SAVING(values).one();
    return res.json(result);
  });
};
