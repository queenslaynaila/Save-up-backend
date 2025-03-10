import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import verifyGroupMembership from '../../utils';
import logger from '../../logger';

const SQL_UPDATE_GROUP = sql<
  {
    group_id: number;
    name: string;
    user_id: number;
  },
  { name: string }
>(`
  SELECT *
  FROM update_group_name(:group_id, :user_id, :name)
`);

const updateGroup = (router: Router) => {
  router.route({
    method: 'patch',
    path: '/:group_id',
    summary: 'Update group details',
    description: 'Update group name. Requires group admin role.',
    request: {
      params: z.object({
        group_id: z.string().regex(/^[1-9]\d*$/)
      }),
      body: z.object({
        name: z.string().min(1)
      })
    },
    response: {
      200: {
        schema: z.object({
          name: z.string()
        })
      }
    },
    authMiddlewareOptions: {},
    middlewares: [
      verifyGroupMembership({
        requiredGroupRole: 'Admin'
      })
    ],
    handler: async (req, res) => {
      logger.info(`Updating group ${req.params.group_id} name to ${req.body.name} user ${req.user!.id}`);
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