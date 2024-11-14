import { z } from 'zod';
import { baseCategorySchema } from './schema';
import { sql } from '../../db';
import Router from '../../router';

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
    description: `Par1\n Retrieve a list of all categories available in the system. Each category includes an ID, name, description, and image URL.
This is the second paragraph of the description.`,
    response: {
      schema: z.array(categorySchema)
    },
    handler: async (req, res) => {
      const categories = await SQL_GET_ALL_CATEGORIES({}).many();
      res.json(categories);
    }
  });
};

const createCategory = (router: Router) => {
  router.route({
    method: 'post',
    path: '/',
    summary: 'Get list of categories',
    description: `Par1\n Retrieve a list of all categories available in the system. Each category includes an ID, name, description, and image URL.
This is the second paragraph of the description.`,
    response: {
      schema: z.array(categorySchema)
    },
    handler: async (req, res) => {
      res.json({ me: 'test' });
    }
  });
};

export { getAllCategories, createCategory };