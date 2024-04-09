import { Router } from 'express';
import authMiddleware from '../../middleware/auth';
import { CreateCategoryInterface, CategoryInterface, CreateCategorySchema } from '../../types';
import { validateRequest } from '../../middleware/validationMiddleware';
import { sql } from '../../db';

const SQL_CREATE_CATEGORY = sql<CreateCategoryInterface, CategoryInterface>(`
  INSERT INTO categories (name, description)
  VALUES(:name,:description)
  RETURNING id, name, description, created_at;
`);

export default (router: Router) => {
  router.post<Record<string, never>,CategoryInterface,CreateCategoryInterface,Record<string, never>,Record<string, never>>(
    '/',
    authMiddleware(),
    validateRequest(CreateCategorySchema),
    async (req, res) => {
      const { name, description } = req.body;
      const categoryResult = await SQL_CREATE_CATEGORY({ name, description }).one();
      return res.json(categoryResult);
    });
};
