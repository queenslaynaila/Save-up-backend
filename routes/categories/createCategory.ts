import authMiddleware from '../../middleware/auth';
import { Router } from 'express';
import { z } from 'zod';
import { CreateCategorySchema, CategorySchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';

const SQL_CREATE_CATEGORY = sql<z.infer<typeof CreateCategorySchema>, CategorySchema>(`
    INSERT INTO categories (user_id, name, description, created_at, updated_at)
    VALUES (:user_id, :name, :description, NOW(), NOW())
    RETURNING *
`);

export default (router: Router) => {
  router.post<
  Record<string, never>,
  CategorySchema,
  typeof CreateCategorySchema,
  Record<string, never>,
  Record<string, never>
  >('/', authMiddleware(), async (req, res) => {
    const validationResult = CreateCategorySchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new HttpError(400, 'Invalid category data');
    }
    const { user_id, name, description } = validationResult.data;
    const categoryResult = await SQL_CREATE_CATEGORY({ user_id, name, description }).one();
    return res.json(categoryResult);
  });
};
