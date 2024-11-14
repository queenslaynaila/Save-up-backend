import Router from '../../router';
import { z } from 'zod';
import { sql } from '../../db';
import { baseCategorySchema } from './schema';
import express from 'express';

export const app = express();

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

// Create a new router for categories
const categoryRouter = new Router('/categories', 'Categories');

// Define the GET route for categories
categoryRouter.route({
  method: 'get',
  path: '/',
  summary: 'Get list of categories',
  description: 'Retrieve a list of all categories.',
  response: {
    schema: z.array(categorySchema)
  },
  handler: async (req, res) => {
    const categories = await SQL_GET_ALL_CATEGORIES({}).many();
    res.json(categories);
  }
});

// Export the router so it can be used in the entry file
// export default categoryRouter;
