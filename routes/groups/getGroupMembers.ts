import Router from '../../router';
import { sql } from '../../db';

import { z } from 'zod';

const member = z.object({
  user_id: z.number(),
  full_name: z.string()
});
type Member = z.infer<typeof member>;

const SQL_GET_GROUP_MEMBERS = sql<{ group_id: number, user_id:number}, Member>(`
  SELECT * FROM get_group_members(:group_id, :user_id)
`);

const getGroupMembers = (router:Router) => {
  router.route({
    method: 'get',
    path: '/:id',
    schema: {
      params: z.object({
        id: z.string()
      })
    },
    response: {
      schema: z.array(member)
    },
    summary: 'Get group members',
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const group_id = Number(req.params.id);
      const members = await SQL_GET_GROUP_MEMBERS({
        group_id, user_id: req.user!.id
      }).many();
      return res.json(members);
    }
  });
};

export default getGroupMembers;