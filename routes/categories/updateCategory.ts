import { Router } from 'express';
import authMiddleware from '../../middleware/auth';
import { UpdateCategorySchema, idSchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';

let query = 'UPDATE categories SET ';
const SQL_UPDATE_CATEGORY = sql<
  { name?: string; description?: string; id: string; user_id: string },
  Record<string, never>
>(query);

export default (router: Router) => {
  router.patch('/:id', authMiddleware(), async (req, res) => {
    const validationResultId = idSchema.safeParse(req.params.id);
    if (!validationResultId.success) {
      throw new HttpError(400, 'Invalid category ID');
    }
    const id = validationResultId.data;
    const loggedInUserId = req.user!.id;
    const validationResultBody = UpdateCategorySchema.safeParse(req.body);
    if (!validationResultBody.success) {
      throw new HttpError(422, 'Invalid category data');
    }
    const { name, description } = validationResultBody.data;

    const values = [];

    if (name) {
      query += `name = :name, `;
      values.push(name);
    }
    if (description) {
      query += `description = :description, `;
      values.push(description);
    }

    query += 'updated_at = NOW() WHERE id = :id AND user_id = :user_id RETURNING *';
    values.push(id, loggedInUserId);

    const result = await SQL_UPDATE_CATEGORY({
      name,
      description,
      id,
      user_id: loggedInUserId,
    }).one(new HttpError(404, 'Category not found'));
    res.json(result);
  });
};
