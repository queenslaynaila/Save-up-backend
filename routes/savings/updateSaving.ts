import { Router } from 'express';
import { HttpError } from '../../middleware/errorMiddleware';
import { idSchema, updateSavingSchema } from '../../types';
import authMiddleware from '../../middleware/auth';
import { UserRole } from '../../types';
import pool from '../../db';

export default (router: Router) => {
  router.patch('/:id', authMiddleware(), async (req, res) => {
    const savingId = req.params.id;
    const validationResult = idSchema.safeParse(savingId);
    if (!validationResult.success) {
      return res.status(400).json({ error: new HttpError(400, 'Invalid saving ID').message });
    }
    const userId = req.user?.id;

    const validatedSavings = updateSavingSchema.safeParse(req.body);
    if (!validatedSavings.success) {
      throw new HttpError(422, 'Invalid saving data');
    }
    const { description, target_amount, priority, target_date } = validatedSavings.data;

    let query = 'UPDATE savings SET ';
    const values = [];
    if (description) {
      query += `description = $${values.length + 1}, `;
      values.push(description);
    }

    if (target_amount) {
      query += `target_amount = $${values.length + 1}, `;
      values.push(target_amount);
    }
    if (priority) {
      query += `priority = $${values.length + 1}, `;
      values.push(priority);
    }
    if (target_date) {
      query += `target_date = $${values.length + 1}, `;
      values.push(target_date);
    }
    query = query.slice(0, -2);
    query += ` WHERE user_id = $${values.length + 1} AND id = $${values.length + 2} RETURNING *`;
    values.push(userId, savingId);

    const result = await pool.query(query, values);
    const updatedSaving = result.rows[0];

    if (!updatedSaving) {
      throw new HttpError(422, 'Saving not found');
    }

    return res.json(updatedSaving);
  });
};
