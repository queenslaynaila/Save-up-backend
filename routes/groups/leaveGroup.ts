import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';

const SQL_MANAGE_GROUP_MEMBERSHIP = sql<{group_id: number, initiator_id: number, target_id: number}, {initiator_name: string, target_name: string}>(`
  SELECT * FROM manage_group_membership (:group_id, :initiator_id, :target_id);
`);

const groupParams = z.object({
  group_id: z.string(),
  member_id: z.string()
});

const manageGroupMembership = (router: Router) => {
  router.route({
    method: 'delete',
    path: '/:group_id/members/:member_id',
    summary: 'Manage group membership (exit or remove)',
    description: 'Allows a user to exit a group or an admin to remove a member from a group. If the member_id is special string "me" or its equal to the logged in userid, it indicates a self-removal; otherwise, it is an admin removal.',
    request: {
      params: groupParams
    },
    response: {
      200: {
        schema: z.object({
          initiator_name: z.string().nullable(),
          target_name: z.string()
        })
      }
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const target_id = req.params.member_id === 'me' ? req.user!.id : Number(req.params.member_id);
      const result = await SQL_MANAGE_GROUP_MEMBERSHIP({
        group_id: Number(req.params.group_id),
        initiator_id: req.user!.id,
        target_id
      }).one();
      res.json(result);
    }
  });
};

export default manageGroupMembership;