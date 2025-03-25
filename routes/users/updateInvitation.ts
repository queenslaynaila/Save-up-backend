import { z } from 'zod';
import { sql } from '../../db';
import Router from '../../router';
import { Invitation, invitationSchema } from './schema';

const SQL_RESPOND_TO_INVITE = sql<
  Pick<Invitation, 'xid' | 'group_id' | 'status' | 'receiver_id'>,
  Record<string, never>
>(`
  SELECT update_invite(
    :xid,
    :group_id,
    :receiver_id,
    :status
  )
`);

const updateInvites = (router: Router) => {
  router.route({
    method: 'patch',
    path: '/me/invitations/:xid',
    summary: 'Respond to a group invitation',
    auth: true,
    request: {
      params: z.object({
        xid: z.number().int().min(1)
      }),
      body: invitationSchema.pick({
        group_id: true,
        status: true
      })
    },
    handler: async (req, res) => {
      await SQL_RESPOND_TO_INVITE({
        xid: req.params.xid,
        receiver_id: req.user!.id,
        ...req.body
      }).exec();

      res.sendStatus(204);
    }
  });
};

export default updateInvites;