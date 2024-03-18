import { Router } from 'express';
import { z } from 'zod';
import authMiddleware from '../../middleware/auth';
import { UpdateCategorySchema,CategorySchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';

const SQL_UPDATE_CATEGORY = sql<z.infer<typeof UpdateCategorySchema> & { id: string; user_id: string },CategorySchema>(`
  UPDATE categories
  SET name = coalesce(:name, categories.name), 
      description = coalesce(:description, categories.description)
  WHERE user_id = :user_id AND id = :category_id
  RETURNING *
`);

export default (router: Router) => {
  router.patch('/:id', authMiddleware(), async (req, res) => {
    const categoryId = req.params.id;
    const userId = req.user!.id;

    const validatedCategory = UpdateCategorySchema.safeParse(req.body);
    if (!validatedCategory.success) {
      throw new HttpError(422, 'Invalid category data');
    }
    
    const { name, description } = validatedCategory.data;
    const result = SQL_UPDATE_CATEGORY({
      user_id: userId,
      id: categoryId,
      name: name, 
      description: description ,
    }).one(new HttpError(400, 'Category not found'));

    return res.json(result);
  });
};