import { z } from 'zod';
import { sql } from '../../db';
import { Category, categorySchema } from './getAllCategories';
import { UserRole } from '../users/schema';
import Router from '../../core/router';

const SQL_CREATE_CATEGORY = sql<
Record<string, never>,
Pick<Category, 'id'|'name'|'description'|'image_url'> & {created_at:string}
>(`
   INSERT INTO categories (name, description, image_url)
   VALUES (:name, :description, :image_url)
`);

const createCategory = (router: Router) => {
  router.post({
    path: '/',
    summary: 'Create a new category',
    schema: {
      body: z.object({
        name: z.string(),
        description: z.string(),
        image_url: z.string()
      })
    },
    response: {
      statusCode: 201,
      schema: categorySchema.pick({
        id: true,
        name: true,
        description: true,
        image_url: true
      }).extend({
        created_at: z.string()
      })
    },
    auth: [UserRole.enum.Admin],
    handler: async (_req, res) => {
      const category = await SQL_CREATE_CATEGORY({}).one();
      res.json(category);
    }
  });
};

export default createCategory;