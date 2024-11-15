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
    description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

    Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Nulla sit amet est at nulla gravida ullamcorper. Integer velit nulla, tincidunt at velit vel, ultricies rutrum felis. Vivamus auctor mauris vitae est malesuada, sed fermentum magna venenatis.
`,
    response: {
      schema: z.array(categorySchema)
    },
    handler: async (req, res) => {
      const categories = await SQL_GET_ALL_CATEGORIES({}).many();
      res.json(categories);
    }
  });
};

export default getAllCategories;