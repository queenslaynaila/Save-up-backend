import Router from '../../router';
import { sql } from '../../db';
import { InviteInputInterface, userInviteSchema } from './types';
import HttpError from '../../httpError';
import { z } from 'zod';

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
    summary: 'Send a group invitation to an existing user via phone number',
    request: {
      body: userInviteSchema
    },
    response: {
      204: {},
      400: { schema: z.object({ message: z.string() }) }
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const { exists } = await SQL_CHECK_USER_EXISTENCE({
        phone_number: req.body.phone_number
      }).one();

      if (!exists) {
        throw new HttpError(400, { message: 'User does not exist' });
      }

      await SQL_SEND_INVITATION({
        ...req.body, sender_id: req.user!.id
      }).exec();
      res.sendStatus(204);
    }
  });
};

export default sendInvite;