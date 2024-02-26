import authMiddleware from '../../middleware/auth';
import { Router } from 'express';
import { CreateCategorySchema,CategorySchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';


export default (router: Router) => {
  router.post('/', authMiddleware(), async (req, res) => {
    const validationResult = CreateCategorySchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new HttpError(400, 'Invalid category data');
    }

    const { user_id, name, description } = validationResult.data;

    const query = `
      INSERT INTO categories (user_id, name, description, created_at, updated_at)
      VALUES (:user_id, :name, :description, NOW(), NOW())
      RETURNING *
    `;

    const SQL_INSERT_CATEGORY = sql<typeof validationResult.data, CategorySchema>(query);
    const categoryResult = await SQL_INSERT_CATEGORY({ user_id, name, description }).one();
    return res.json(categoryResult);
    
  });
};
