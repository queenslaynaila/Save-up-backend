import authMiddleware from '../../middleware/auth';
import { Router } from 'express';
import { CreateCategorySchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import pool from '../../db';

export default (router: Router) => {
  router.post('/', authMiddleware(), async (req, res) => {
    const validationResult = CreateCategorySchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new HttpError(400, 'Invalid category data');
    }
    const { user_id, name, description } = validationResult.data;
    const categoryQuery = `
        INSERT INTO categories (user_id, name, description, created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())
        RETURNING *`;
    const categoryValues = [user_id, name, description];
    const categoryResult = await pool.query(categoryQuery, categoryValues);
    if (categoryResult.rows.length === 0) {
      throw new HttpError(400, 'Bad request');
    }
    return res.json(categoryResult.rows[0]);
  });
};
