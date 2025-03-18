import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import verifyGroupMembership from '../../utils';
import HttpError from '../../httpError';
import { userIdParamsSchema } from '../users/schema';

const SQL_MANAGE_GROUP_MEMBERSHIP = sql<{ 
  group_id: number; 
  initiator_id: number; 
  target_id: number
 },Record<string, never>>(`
  SELECT exit_or_remove_group_member(:group_id, :initiator_id, :target_id);
`);


const handleGroupExit = (router: Router) => {
  router.route({
    method: 'delete',
    path: '/:group_id/members/:member_id',
    summary: 'Self-removal or Admin removal from group',
    description: 'Allows:\n' +
                '1. Self-removal: Members can leave using `/{group_id}/members/me`\n' +
                '2. Admin removal: Admins can remove others using `/{group_id}/members/{user_id}`',
    request: {
      params: z.object({
        group_id: z.string(),
        member_id: z.union([
          z.string().regex(/^[1-9]\d*$/),
          z.literal("me")
        ]).default('me')
      })
    },
    auth: true,
    middlewares: [verifyGroupMembership()],
    handler: async (req, res) => {
      const target_id = Number(req.params.member_id);
      
      await SQL_MANAGE_GROUP_MEMBERSHIP({
        group_id: Number(req.params.group_id),
        initiator_id: req.user!.id,
        target_id
      }).exec().catch(err => {
        if(err.code === 'P0006') {
          throw new HttpError(403, { message: 'ERR_CANT_REMOVE_USER_WITH_DEPOSITS'});
        }
        throw err;
      });

      res.sendStatus(204);
    }
  });
};

export default handleGroupExit;