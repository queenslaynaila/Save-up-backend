import Router from '../../router';
import { sql } from '../../db';
import { Group, groupsSchema } from './schema';
import { z } from 'zod';

const SQL_CREATE_GROUP = sql<
  Pick<Group, 'name' | 'creator_id'>,
  Pick<Group, 'id' | 'name' | 'created_at'> & {created_by:string}
>(`
  SELECT * FROM create_group(
    :name,
    :creator_id
  )
`);

const createGroup = (router: Router) => {
  router.route({
    method: 'post',
    path: '/',
    summary: 'Create a group',
    auth: true,
    schema: {
      body: groupsSchema.pick({
        name: true
      })
    },
    response: {
        statusCode: 201,
        schema: groupsSchema.pick({
          id: true,
          name: true,
          created_at: true
        }).extend({
          created_by: z.string()
        })
    },
    handler: async (req, res) => {
      const group = await SQL_CREATE_GROUP({
        creator_id: req.user!.id,
        ...req.body
      }).one();

      return res.status(201).json(group);
    }
  });
};

export default createGroup;