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

type Invitations = z.infer<typeof pendingInvitations>;

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

const getInvites = (router: Router) => {
  router.route({
    method: 'get',
    path: '/',
    summary: 'Get pending group invitations for logged-in user',
    response: {
      200: {
        schema: pendingInvitations.array()
      }
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const invitations = await SQL_GET_PENDING_INVITATIONS({
        receiver_id: req.user!.id
      }).many();
      res.json(invitations);
    }
  });
};
export default getInvites;