import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import sendSms from '../../services/sms';

const SQL_SEND_INVITATION = sql<{
  group_id: number;
  sender_id: number;
  phone_number: string;
}, { is_member: boolean; sender_name: string, group_name:string }>(`
  SELECT send_invite(:group_id, :phone_number, :sender_id)
`);

const createInvite = (router: Router) => {
  router.route({
    method: 'post',
    path: '/',
    summary: 'Send a group invitation via phone number',
    description: 'Allows a user to send an invitation to a member or non members. The invitees will receive an SMS with a link to join the group.For non-members, the SMS will include a link to sign up for SaveUP and once theyve signed up theyll find the invite in their notifications.',
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
      const { is_member, sender_name, group_name } = await SQL_SEND_INVITATION({
        group_id: req.body.group_id,
        phone_number: req.body.phone_number,
        sender_id: req.user!.id
      }).one();

      const inviteLink = 'https://save-up-seven.vercel.app/notifications';
      const signupLink = `https://save-up-seven.vercel.app/sign-up?phone=${encodeURIComponent(req.body.phone_number)}`;
      const message = is_member
        ? `${sender_name} invited you to join a group ${group_name} on SaveUP. View your invite here: ${inviteLink}`
        : `${sender_name} invited you to join a group ${group_name} on SaveUP. Sign up here: ${signupLink} to join the group`;
      sendSms(req.body.phone_number, message);

      res.sendStatus(204);
    }
  });
};

export default createInvite;