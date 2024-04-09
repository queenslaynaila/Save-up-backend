import { Router } from 'express';
import { sql } from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/auth';
import { validateRequest } from '../../middleware/validationMiddleware';
import { CreateCategoryInterface, CategoryInterface,UpdateCategoryInterface, CreateCategorySchema } from '../../types';

const SQL_UPDATE_CATEGORY = sql<UpdateCategoryInterface,CategoryInterface>(`
  UPDATE categories
  SET name = COALESCE(:name, categories.name), 
      description = COALESCE(:description, categories.description)
  WHERE id = :category_id
  RETURNING id, name, description, created_at;
`);

export default (router: Router) => {
  router.patch<{  id: string }, CategoryInterface,CreateCategoryInterface, Record<string, never>>(
    '/:id', 
    authMiddleware(), 
    validateRequest(CreateCategorySchema),
    async (req, res) => {
      const categoryId = req.params.id;
      const { name, description } = req.body;
      const result = await SQL_UPDATE_CATEGORY({
        id: parseInt(categoryId),
        name: name, 
        description: description ,
      }).one(new HttpError(404, 'Unable to complete the request.Try again'));
      return res.json(result);
    });
};