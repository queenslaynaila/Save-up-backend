import { z } from 'zod';
import { baseCategorySchema } from './schema';
import { sql } from '../../db';
import Router from '../../router';
import authMiddleware from '../../middleware/authorization';

const categorySchema = baseCategorySchema.pick({
  id: true,
  name: true,
  description: true,
  image_url: true
});
type Category = z.infer<typeof categorySchema>;

export const SQL_GET_ALL_CATEGORIES = sql<Record<string, never>, Category>(`
  SELECT id, name, description, image_url 
  FROM categories 
  WHERE deleted_at IS NULL
`);

const getAllCategories = (router: Router) => {
  router.route({
    method: 'get',
    path: '/',
    summary: 'Get list of categories',
    security: [{ 'authorization-token': [] }],
    response: {
      schema: z.array(categorySchema)
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      const categories = await SQL_GET_ALL_CATEGORIES({}).many();
      res.json(categories);
    }
  });
};

export default getAllCategories;