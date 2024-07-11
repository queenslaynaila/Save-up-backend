import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import validateRequest from '../../middleware/validationMiddleware';
import { CategoryInterface } from './types';
import { headersSchema } from '../../globalTypes';

const SQL_GET_ALL_CATEGORIES = sql<Record<string,never>, CategoryInterface>(`
  SELECT id, name, description, image_url 
  FROM categories 
  WHERE deleted_at IS NULL
`);

export default (router: Router) => {
  router.get<Record<string,never>, CategoryInterface[], Record<string,never>, 
  Record<string,never>>(
    '/',
    validateRequest({ headers:headersSchema }),
    authMiddleware(),
    async (_req, res) => {
      const categories = await SQL_GET_ALL_CATEGORIES({}).many();
      res.json(categories);
    });
};