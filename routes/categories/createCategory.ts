import authMiddleware from '../../middleware/auth';
import { Router } from 'express';
import { CreateCategorySchema, CategorySchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';

interface CreateCategory{
  user_id: string
  name: string
  description: string
}

const SQL_CREATE_CATEGORY = sql<CreateCategory, CategorySchema>(`
    INSERT INTO categories (user_id, name, description, created_at, updated_at)
    VALUES (:user_id, :name, :description, NOW(), NOW())
    RETURNING *
`);

export default (router: Router) => {
  router.post<Record<string, never>,CategorySchema,CreateCategory,Record<string, never>,Record<string, never>>(
    '/', 
    authMiddleware(), 
    async (req, res) => {
      const validationResult = CreateCategorySchema.safeParse(req.body);
      if (!validationResult.success) {
        throw new HttpError(400, 'Invalid category data');
      }
      const { user_id, name, description } = validationResult.data;
      const categoryResult = await SQL_CREATE_CATEGORY({ user_id, name, description }).one();
      return res.json(categoryResult);
    });
};
