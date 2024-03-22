import authMiddleware from '../../middleware/auth';
import { Router } from 'express';
import { CreateCategorySchema, CategorySchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';

type CreateCategory ={
  user_id: number
  name: string
  description: string
}

const SQL_CREATE_CATEGORY = sql<CreateCategory, CategorySchema>(`
  INSERT INTO categories (id, user_id, name, description)
  SELECT COALESCE((SELECT MAX(id) FROM categories WHERE user_id = :user_id), 0) + 1,
        :user_id, :name, :description
  RETURNING id, user_id, name, description, created_at;
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
