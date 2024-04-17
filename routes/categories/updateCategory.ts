import { Router } from 'express';
import { sql } from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import { CategoryInterface, UpdatedCategoryInterface, IdParamInterface, CreateCategorySchema, UserRole } from '../../types';

const SQL_UPDATE_CATEGORY = sql<UpdatedCategoryInterface, CategoryInterface>(`
  UPDATE categories
  SET name = COALESCE(:name, categories.name), 
      description = COALESCE(:description, categories.description)
  WHERE id = :id
  RETURNING id, name, description, created_at;
`);

export default (router: Router) => {
  router.patch<IdParamInterface, CategoryInterface, UpdatedCategoryInterface, Record<string, never>>(
    '/:idn', 
    authMiddleware({roles:[ UserRole.ADMIN ]}),
    validateRequest(CreateCategorySchema),
    async (req, res) => {
      const categoryId = parseInt(req.params.id);
      const { name, description } = req.body;
      const result = await SQL_UPDATE_CATEGORY({
        id: categoryId,
        name: name, 
        description: description ,
      }).one(new HttpError(404, 'Not found'));
      return res.json(result);
    });
};