import { Router } from 'express';
import { z } from 'zod';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { baseCategorySchema } from './schema';

const categorySchema = baseCategorySchema.pick({
  id: true,
  name: true,
  description: true,
  image_url: true
});
type Category = z.infer<typeof categorySchema>;

const SQL_GET_ALL_CATEGORIES = sql<Record<string, never>, Category>(`
  SELECT id, name, description, image_url 
  FROM categories 
  WHERE deleted_at IS NULL
`);

export default (router: Router) => {
  router.get<Record<string, never>, Category[], Record<string, never>,
  Record<string, never>>(
    '/',
    authMiddleware(),
    async (_req, res) => {
      const categories = await SQL_GET_ALL_CATEGORIES({}).many();
      res.json(categories);
    }
  );
};