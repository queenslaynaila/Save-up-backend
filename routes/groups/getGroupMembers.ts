import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import HttpError from '../../httpError';

const member = z.object({
  user_id: z.number().min(1),
  full_name: z.string(),
  joined_at: z.string().datetime(),
  is_admin: z.boolean()
});
type Member = z.infer<typeof member>;

const SQL_GET_GROUP_MEMBERS = sql<{ 
  group_id: number, 
  user_id: number, 
  allow_admin_access?: boolean 
}, Member>(`
  SELECT * FROM get_group_members(:group_id, :user_id, :allow_admin_access)
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
        user_id: req.user!.id,
        allow_admin_access: true
      }).many().catch((err) => {
          if (err.code === 'P0001') {
            throw new HttpError(401);
          }
          throw err;
      });
      return res.json(members);
    }
  });
};

export default getGroupMembers;