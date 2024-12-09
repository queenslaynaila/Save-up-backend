import Router from '../../router';
import { sql } from '../../db';

import { baseInviteInterface, baseInviteSchema, InviteByReceiverInterface } from './types';

const SQL_GET_PENDING_INVITATIONS = sql<InviteByReceiverInterface, baseInviteInterface>(`
  SELECT 
    invitations.sender_id,
    invitations.group_id,
    user_contact_details.full_name AS sender_name,
    groups.name AS group_name,
    invitations.created_at
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
        schema: baseInviteSchema.array()
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