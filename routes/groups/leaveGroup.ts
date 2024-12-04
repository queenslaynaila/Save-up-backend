import Router from '../../router';
import { sql } from '../../db';

import { z } from 'zod';

const SQL_EXIT_GROUP = sql<{group_id: number, user_id: number}, {name: string}>(`
  SELECT * FROM leave_group (:group_id, :user_id);
`);

const groupParams = z.object({
  group_id: z.string()
});

const leaveGroup = (router:Router) => {
  router.route({
    method: 'delete',
    path: '/:group_id',
    summary: 'Exit a group',
    schema: {
      params: groupParams
    },
    response: {
      schema: z.object({
        name: z.string()
      })
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const group = await SQL_EXIT_GROUP({
        group_id: Number(req.params.group_id),
        user_id: req.user!.id
      }).one();
      res.json(group);
    }
  });
};

export default leaveGroup;