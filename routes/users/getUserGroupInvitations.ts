import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import { entityIdParamsSchema, invitationSchema } from './schema';
import { decodeEntityAndVerifyAccess } from '../../utils';

const pendingInvitations = invitationSchema
  .pick({
    xid: true,
    group_id: true,
    sender_id: true
  })
  .extend({
    group_name: z.string(),
    sender_name: z.string()
  });

type Invitations = z.infer<typeof pendingInvitations>;

const SQL_GET_PENDING_INVITATIONS = sql<
  { user_id: number },
  Pick<Invitations,
    'group_id' | 'xid' | 'group_name' | 'sender_id' | 'sender_name'>
>(`
  SELECT 
    invitations.xid,
    invitations.group_id,
    groups.name AS group_name,
    invitations.sender_id,
    user_contact_details.full_name AS sender_name
  FROM invitations
  JOIN groups 
    ON invitations.group_id = groups.id
  JOIN user_contact_details 
    ON invitations.sender_id = user_contact_details.id
  WHERE invitations.receiver_id = :user_id
    AND invitations.status = 'Pending'
`);

const getInvites = (router: Router) => {
  router.get({
    path: '/:user_id/invitations',
    summary: 'Get pending invitations for a user',
    auth: true,
    schema: {
      params: z.object({
        user_id: entityIdParamsSchema
      })
    },
    response: {
        schema: z.array(pendingInvitations.pick({
          group_id: true,
          xid: true,
          sender_id: true,
          sender_name: true,
          group_name: true
        }))
    },
    handler: async (req, res) => {
      const userId = await decodeEntityAndVerifyAccess(req, true);

      const invites = await SQL_GET_PENDING_INVITATIONS({
        user_id: userId
      }).many();

      return res.json(invites);
    }
  });
};

export default getInvites;