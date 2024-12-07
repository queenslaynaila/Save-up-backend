import Router from '../../router';
import { sql } from '../../db';

import {
  InviteInputInterface, userInviteSchema } from './types';

const SQL_CHECK_USER_EXISTENCE = sql<{ phone_number: string }, { exists: boolean }>(`
  SELECT EXISTS (
    SELECT 1 FROM user_contact_details 
    WHERE phone_number = :phone_number
  ) AS exists
`);

const SQL_SEND_INVITATION = sql<InviteInputInterface, Record<string, never>>(`
  SELECT send_invite( :group_id, :phone_number, :sender_id)
`);

const sendInvite = (router: Router) => {
  router.route({
    method: 'post',
    path: '/',
    summary: 'Send an invitation to a user',
    request: {
      body: userInviteSchema
    },
    response: {
      204: {}
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const { exists } = await SQL_CHECK_USER_EXISTENCE({
        phone_number: req.body.phone_number
      }).one();

      if (!exists) {
        res.sendStatus(404);
        return;
      }

      await SQL_SEND_INVITATION({
        ...req.body, sender_id: req.user!.id
      }).exec();
      res.sendStatus(204);
    }
  });
};

export default sendInvite;