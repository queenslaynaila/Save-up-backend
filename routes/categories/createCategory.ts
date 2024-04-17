import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import { CreateCategoryInterface, CategoryInterface, CreateCategorySchema, UserRole} from '../../types';

const SQL_CREATE_CATEGORY = sql<CreateCategoryInterface, CategoryInterface>(`
  INSERT INTO categories (name, description)
  VALUES(:name,:description)
  RETURNING id, name, description, created_at;
`);

export default (router: Router) => {
  router.post<Record<string, never>,CategoryInterface,CreateCategoryInterface,Record<string, never>,Record<string, never>>(
    '/',
    authMiddleware({roles:[ UserRole.ADMIN ]}),
    validateRequest(CreateCategorySchema),
    async (req, res) => {
      const { name, description } = req.body;
      const categoryResult = await SQL_CREATE_CATEGORY({ name, description }).one();
      return res.json(categoryResult);
    });
};
