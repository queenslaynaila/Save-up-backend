import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import verifyGroupMembership from '../../utils';
import { groupsSchema } from './schema';

const SQL_UPDATE_GROUP = sql<
  {
    group_id: number;
    name: string;
    user_id: number;
  },
  { 
    name: string 
  }
>(`
  SELECT * 
  FROM update_group_name(
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
    request: {
      params: z.object({
        group_id: z.string()
          .regex(/^[1-9]\d*$/)
      }),
      body: groupsSchema.pick({
        name: true
      })
    },
    response: {
      200: {
        schema: groupsSchema.pick({
          name: true
        }),
      }
    },
    authMiddlewareOptions: {},
    middlewares: [
      verifyGroupMembership({
        requiredGroupRole: 'Admin'
      })
    ],
    handler: async (req, res) => {
      const { name } = await SQL_UPDATE_GROUP({
        group_id: Number(req.params.group_id),
        user_id: req.user!.id,
        name: req.body.name
      }).one();

      res.json({ name });
    }
  });
};

export default updateGroup;