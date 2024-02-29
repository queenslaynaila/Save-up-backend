import { Router } from 'express';
import { z } from 'zod';
import authMiddleware from '../../middleware/auth';
import { UpdateCategorySchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';

const SQL_UPDATE_CATEGORY = (updatedQuery: string) =>sql<z.infer<typeof UpdateCategorySchema> & { id: string; user_id: string }, Record<string, never>>(updatedQuery);

export default (router: Router) => {
  router.patch('/:id', authMiddleware(), async (req, res) => {
    const categoryId = req.params.id;
    const userId = req.user!.id;

    const validatedCategory = UpdateCategorySchema.safeParse(req.body);
    if (!validatedCategory.success) {
      throw new HttpError(422, 'Invalid category data');
    }

    const { name, description } = validatedCategory.data;

    const values: z.infer<typeof UpdateCategorySchema> & { user_id: string; category_id: string; id: string  } = {
      user_id: userId,
      category_id: categoryId,
      id:categoryId
    };

    const query = 'UPDATE categories SET ';
    let param = '';

    if (name) {
      param += `name = :name, `;
      values.name = name;
    }
    if (description) {
      param += `description = :description, `;
      values.description = description;
    }

    param = param.slice(0, -2);

    const updatedQuery = `${query}${param} WHERE user_id = :user_id AND id = :category_id RETURNING *`;
    console.log(updatedQuery)
    console.log(values)

    const result = await SQL_UPDATE_CATEGORY(updatedQuery)(values).one(new HttpError (400, 'Category not found'));

    return res.json(result);
  });
};
