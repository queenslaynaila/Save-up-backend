import Router from '../../router';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { groupsSchema } from './schema';
import { z } from 'zod';

const groupParams = groupsSchema.pick({
  name: true
});

const groupCreationSchema = groupsSchema.pick({
  name: true
}).extend({
  created_by: z.number()
});
type GroupCreationInterface = z.infer<typeof groupCreationSchema>;

export const group = groupsSchema.pick({
  id: true,
  name: true,
  created_at: true
});
export type Group = z.infer<typeof group>;

const SQL_CREATE_GROUP = sql<GroupCreationInterface, Group>(`
    SELECT * FROM create_group(:name, :created_by )
`);

const createGroup = (router:Router) => {
  router.route({
    method: 'post',
    path: '/',
    summary: 'Create a group',
    schema: {
      body: groupParams
    },
    response: {
      schema: group,
      statusCode: 201
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      const createdGroup = await SQL_CREATE_GROUP({
        ...req.body,
        created_by: req.user!.id
      }).one();
      res.status(201).json(createdGroup);
    }
  });
};

export default createGroup;