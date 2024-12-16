import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';

const member = z.object({
  user_id: z.number().min(1),
  full_name: z.string()
});
type Member = z.infer<typeof member>;

const SQL_GET_GROUP_MEMBERS = sql<{ group_id: number, user_id:number}, Member>(`
  SELECT * FROM get_group_members(:group_id, :user_id)
`);

const getGroupMembers = (router:Router) => {
  router.route({
    method: 'get',
    path: '/:group_id/members',
    request: {
      params: z.object({
        group_id: z.string()
      })
    },
    response: {
      200: {
        schema: z.array(member)
      }
    },
    summary: 'Get group members',
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const members = await SQL_GET_GROUP_MEMBERS({
        group_id: Number(req.params.group_id),
        user_id: req.user!.id
      }).many();
      return res.json(members);
    }
  });
};

export default getGroupMembers;