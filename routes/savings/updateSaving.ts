import { Router } from 'express';
import { z } from 'zod';
import authMiddleware from '../../middleware/auth';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';
import { savingInterface } from './index';
import { updateSavingSchema } from '../../types';

const SQL_UPDATE_SAVING = (updated: string) =>
  sql<z.infer<typeof updateSavingSchema>, savingInterface>(updated);

export default (router: Router) => {
  router.patch('/:id', authMiddleware(), async (req, res) => {
    const savingId = req.params.id;
    const userId = req.user!.id;

    const validatedSavings = updateSavingSchema.safeParse(req.body);
    if (!validatedSavings.success) {
      throw new HttpError(422, 'Invalid saving data');
    }

    const { description, category_id, amount, priority, target_date } = validatedSavings.data;

    const values: z.infer<typeof updateSavingSchema> & { user_id: string; saving_id: string } = {
      user_id: userId,
      saving_id: savingId,
    };

    const query = 'UPDATE savings SET ';
    let param = '';

    if (description) {
      param += `description = :description, `;
      values.description = description;
    }
    if (category_id) {
      param += `category_id = :category_id, `;
      values.category_id = category_id;
    }
    if (amount) {
      param += `amount = :amount, `;
      values.amount = amount;
    }
    if (priority) {
      param += `priority = :priority, `;
      values.priority = priority;
    }
    if (target_date) {
      param += `target_date = :target_date, `;
      values.target_date = target_date;
    }

    param = param.slice(0, -2);

    const updated = `${query}${param} WHERE user_id = :user_id AND id = :saving_id RETURNING *`;

    const result = await SQL_UPDATE_SAVING(updated)(values).one();

    return res.json(result);
  });
};
