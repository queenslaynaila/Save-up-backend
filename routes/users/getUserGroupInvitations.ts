import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import { entityIdParamsSchema, invitationSchema } from './schema';
import { decodeEntityOrUserId } from '../../utils';

const pendingInvitations = invitationSchema.pick({
  xid: true,
  group_id: true,
  sender_id: true
}).extend({
  group_name: z.string(),
  sender_name: z.string()
});

type Invitations = z.infer<typeof pendingInvitations>;

const SQL_GET_PENDING_INVITATIONS = sql<{user_id:number}, Invitations>(`
  SELECT 
    invitations.xid,
    invitations.group_id,
    groups.name AS group_name,
    invitations.sender_id,
    user_contact_details.full_name AS sender_name
  FROM invitations
  JOIN groups ON invitations.group_id = groups.id
  JOIN user_contact_details ON invitations.sender_id = user_contact_details.id
  WHERE invitations.receiver_id = :user_id
  AND invitations.status = 'Pending'
`);

const getInvites = (router: Router) => {
  router.route({
    method: 'get',
    path: '/:user_id/invitations',
    summary: 'Get pending invitations for a user',
    request:{
      params: z.object({
        user_id: entityIdParamsSchema
      }),
    },
    response: {
      200: {
        schema: pendingInvitations.array()
      }
    },
    auth:true,
    handler: async (req, res) => {
      const userId = decodeEntityOrUserId(req, true);;
      const receivedInvites = await SQL_GET_PENDING_INVITATIONS({
        user_id: userId
      }).many();
      return res.json(receivedInvites);
    }
  });
};
export default getInvites;