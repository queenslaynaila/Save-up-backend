import Router from '../../router';
import { sql } from '../../db';
import { groupsSchema } from './schema';
import { z } from 'zod';

const groupCreationSchema = groupsSchema.pick({
  name: true
}).extend({
  created_by: z.number()
});
type GroupCreationInterface = z.infer<typeof groupCreationSchema>;

export const groupAttributes = groupsSchema.pick({
  id: true,
  name: true,
  created_at: true
});
export type Group = z.infer<typeof groupAttributes>;

const SQL_CREATE_GROUP = sql<GroupCreationInterface, Group>(`
    SELECT * FROM create_group(:name, :created_by )
`);

const createGroup = (router:Router) => {
  router.route({
    method: 'post',
    path: '/',
    summary: 'Create a group',
    request: {
      body: z.object({
        name: z.string()
      })
    },
    response: {
      201: {
        schema: groupAttributes
      }
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const group = await SQL_CREATE_GROUP({
        ...req.body,
        created_by: req.user!.id
      }).one();
      res.status(201).json(group);
    }
  });
};

export default createGroup;