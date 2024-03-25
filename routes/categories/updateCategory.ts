import { Router } from 'express';
import { z } from 'zod';
import authMiddleware from '../../middleware/auth';
import { UpdateCategorySchema,CategorySchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';

const SQL_UPDATE_CATEGORY = sql<z.infer<typeof UpdateCategorySchema> & { id: number; user_id:number },CategorySchema>(`
  UPDATE categories
  SET name = COALESCE(:name, categories.name), 
      description = COALESCE(:description, categories.description)
  WHERE user_id = :user_id AND id = :category_id
  RETURNING id, user_id, name, description, created_at;
`);

export default (router: Router) => {
  router.patch('/:id', authMiddleware(), async (req, res) => {
    const categoryId = req.params.id;
    const userId = req.user!.id;

    const validatedCategory = UpdateCategorySchema.safeParse(req.body);
    if (!validatedCategory.success) {
      throw new HttpError(422, "Unprocessable Entity");
    }
    
    const { name, description } = validatedCategory.data;
    const result = SQL_UPDATE_CATEGORY({
      user_id: userId,
      id: parseInt(categoryId),
      name: name, 
      description: description ,
    }).one(new HttpError(404, 'Unable to complete the request'));

    return res.json(result);
  });
};