import Router from '../../router';
import { sql } from '../../db';
import { invitationSchema } from './schema';
import { z } from 'zod';

const pendingInvitations = invitationSchema.pick({
  xid: true,
  group_id: true,
  sender_id: true
}).extend({
  group_name: z.string(),
  sender_name: z.string()
});

const sentInvitations = z.object({
  xid: z.number(),
  sender_id: z.number(),
  sender_name: z.string(),
  sent_to: z.string(),
  receiver_id: z.number().nullable() 
});

type Invitations = z.infer<typeof pendingInvitations>;
type SentInvitations = z.infer<typeof sentInvitations>;

const SQL_GET_PENDING_INVITATIONS = sql<{receiver_id:number}, Invitations>(`
  SELECT 
    invitations.xid,
    invitations.group_id,
    groups.name AS group_name,
    invitations.sender_id,
    user_contact_details.full_name AS sender_name
  FROM invitations
  JOIN groups ON invitations.group_id = groups.id
  JOIN user_contact_details ON invitations.sender_id = user_contact_details.id
  WHERE invitations.receiver_id = :receiver_id
  AND invitations.status = 'Pending'
`);

const SQL_GET_SENT_PENDING_INVITATIONS= sql<{group_id:number}, SentInvitations>(`
  SELECT 
    invitations.xid,
    invitations.sender_id,
    user_contact_details.full_name AS sender_name,
    invitations.phone_number AS sent_to,
    invitations.receiver_id
  FROM invitations
  JOIN user_contact_details ON invitations.sender_id = user_contact_details.id
  WHERE invitations.group_id = :group_id
  AND invitations.status = 'Pending';
`);

const getInvites = (router: Router) => {
  router.route({
    method: 'get',
    path: '/',
    summary: 'Get pending group invitations for logged-in user or pending sent invites for grp',
    request:{
      query: z.object({
        group_id: z.string().optional()
      })
    },
    response: {
      200: {
        schema: z.union([ sentInvitations.array(), pendingInvitations.array(),])
      }
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const group_id  = Number(req.query.group_id) ?? undefined;

      if ( group_id) {
        const sentInvites = await SQL_GET_SENT_PENDING_INVITATIONS({
          group_id: Number(group_id)
        }).many();
        return res.json(sentInvites);
      }

      const receivedInvites = await SQL_GET_PENDING_INVITATIONS({
        receiver_id: req.user!.id
      }).many();
      return res.json(receivedInvites);
    }
  });
};
export default getInvites;