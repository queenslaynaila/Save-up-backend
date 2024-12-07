import { z } from 'zod';
import { sql } from '../../db';
import Router from '../../router';

const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  image_url: z.string()
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
    response: {
      200: {
        schema: z.array(categorySchema)
      }
    },
    authMiddlewareOptions: {},
    handler: async (_req, res) => {
      const categories = await SQL_GET_ALL_CATEGORIES({}).many();
      res.json(categories);
    }
  });
};

export default getAllCategories;