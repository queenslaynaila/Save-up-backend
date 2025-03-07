import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';

const SQL_MANAGE_GROUP_MEMBERSHIP = sql<{ 
  group_id: number; 
  initiator_id: number; 
  target_id: number
 },Record<string, never>>(`
  SELECT exit_or_remove_group_member(:group_id, :initiator_id, :target_id);
`);


const manageGroupMembership = (router: Router) => {
  router.route({
    method: 'delete',
    path: '/:group_id/members/:user_id',
    summary: 'Self-removal or Admin removal from group',
    description: 'Allows:\n' +
                '1. Self-removal: Members can leave using `/{group_id}/members/me`\n' +
                '2. Admin removal: Admins can remove others using `/{group_id}/members/{user_id}`',
    request: {
      params: z.object({
        group_id: z.string(),
        user_id: z.union([
          z.string().regex(/^[1-9]\d*$/, "Must be a positive integer string"),
          z.literal("me")
        ]).default('me')
      })
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const target_id = Number(req.params.user_id);
      
      await SQL_MANAGE_GROUP_MEMBERSHIP({
        group_id: Number(req.params.group_id),
        initiator_id: req.user!.id,
        target_id
      }).exec();

      res.sendStatus(204);
    }
  });
};

export default manageGroupMembership;