import { z } from 'zod';
import { sql } from '../../db';
import Router from '../../router';
import authMiddleware from '../../middleware/authorization';

const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  image_url: z.string(),
  created_at: z.string(),
  deleted_at: z.string()
});

type Category = z.infer<typeof categorySchema>;

export const SQL_GET_ALL_CATEGORIES = sql<
Record<string, never>,
Pick<Category, 'id' | 'name' | 'description' | 'image_url'>>(`
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
      schema: z.array(
        categorySchema.pick({ id: true, name: true, description: true, image_url: true })
      )
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      const categories = await SQL_GET_ALL_CATEGORIES({}).many();
      res.json(categories);
    }
  });
};

export default getAllCategories;