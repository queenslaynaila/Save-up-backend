import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import HttpError from '../../httpError';
import { entityIdParamsSchema } from '../users/schema';
import { decodeEntityAndVerifyAccess } from '../../utils';

const SQL_MANAGE_GROUP_MEMBERSHIP = sql<
  {
    group_id: number;
    initiator_id: number;
    target_id: number;
  },
  Record<string, never>
>(`
  SELECT exit_or_remove_group_member(
    :group_id, 
    :initiator_id, 
    :target_id
  );
`);

const handleGroupExit = (router: Router) => {
  router.route({
    method: 'delete',
    path: '/:group_id/members/:member_id',
    summary: 'Self-removal or Admin removal from group',
    description: [
      'Allows:',
      '1. Self-removal: Members can leave using `/{group_id}/members/me`',
      '2. Admin removal: Admins can remove others using `/{group_id}/members/{member_id}`'
    ].join('\n'),
    auth: true,
    schema: {
      params: z.object({
        group_id: z.number().int().min(1),
        member_id: entityIdParamsSchema
      })
    },
    handler: async (req, res) => {
      const { groupId, memberId } = await decodeEntityAndVerifyAccess(req);
      
      await SQL_MANAGE_GROUP_MEMBERSHIP({
        group_id: groupId,
        initiator_id: req.user!.id,
        target_id: memberId
      }).exec().catch(err => {
        if (err.code === 'P0006') {
          throw new HttpError(403, {
            message: 'ERR_CANT_REMOVE_USER_WITH_DEPOSITS'
          });
        }
        throw err;
      });

      res.sendStatus(204);
    }
  });
};

export default handleGroupExit;