import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import { decodeEntityAndVerifyAccess } from '../../utils';
import { groupsSchema } from './schema';

const SQL_UPDATE_GROUP = sql<
  { group_id: number; name: string; user_id: number;},
  { name: string;}
>(`
  SELECT * FROM update_group_name(
    :group_id,
    :user_id,
    :name
  )
`);

const updateGroup = (router: Router) => {
  router.route({
    method: 'patch',
    path: '/:group_id',
    summary: 'Update group details',
    description: 'Update group name. Requires group admin role.',
    auth: true,
    request: {
      params: z.object({
        group_id: z.number()
      }),
      body: groupsSchema.pick({
        name: true
      })
    },
    response: {
      200: {
        schema: groupsSchema.pick({
          name: true
        })
      }
    },
    handler: async (req, res) => {
      const groupId = await decodeEntityAndVerifyAccess(req);
      
      const { name } = await SQL_UPDATE_GROUP({
        group_id: groupId,
        user_id: req.user!.id,
        ...req.body
      }).one();

      res.json({ name });
    }
  });
};

export default updateGroup;