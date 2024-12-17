import Router from '../../router';
import { sql } from '../../db';
import HttpError from '../../httpError';
import { z } from 'zod';

const SQL_CHECK_USER_EXISTENCE = sql<{ phone_number: string }, { exists: boolean }>(`
  SELECT EXISTS (
    SELECT 1 FROM user_contact_details 
    WHERE phone_number = :phone_number
  ) AS exists
`);

const SQL_SEND_INVITATION = sql<{
  group_id: number;
  sender_id: number;
  phone_number: string;
}, Record<string, never>>(`
  SELECT send_invite( :group_id, :phone_number, :sender_id)
`);

const createInvite = (router: Router) => {
  router.route({
    method: 'post',
    path: '/',
    summary: 'Send a group invitation to an existing user via phone number',
    request: {
      body: z.object({
        group_id: z.number().min(1),
        phone_number: z.string().regex(/^\+\d{1,4}\d{9}$/)
      })
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
        group_id: req.body.group_id,
        phone_number: req.body.phone_number,
        sender_id: req.user!.id
      }).exec();
      res.sendStatus(204);
    }
  });
};

export default createInvite;