import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import sendSms from '../../services/sms';
import verifyGroupMembership from '../../utils';
import HttpError from '../../httpError';

const SQL_SEND_INVITATION = sql<
  {
    group_id: number;
    sender_id: number;
    phone_number: string;
  },
  {
    is_member: boolean;
    sender_name: string;
    group_name: string;
  }
>(`
  SELECT send_invite(:group_id, :phone_number, :sender_id)
`);

const createGroupInvite = (router: Router) => {
  router.route({
    method: 'post',
    path: '/:group_id/invitations',
    summary: 'Send a group invitation via phone number',
    description: 
      'Allows a group admin member to send an invitation to a registered user or ' +
      'non-registered user to join group.\n\n' +
      'The invitees will receive an SMS with a link to join the group.\n\n' +
      'For non-registered users, the SMS will include a special link to sign up ' +
      'for SaveUP and once they have signed up they will find the invite in ' +
      'their notifications.',
    request: {
      params: z.object({
        group_id: z.string().regex(/^[1-9]\d*$/)
      }),
      body: z.object({
        phone_number: z.string().regex(/^\+\d{1,4}\d{9}$/)
      })
    },
    authMiddlewareOptions: {},
    middlewares: [
      verifyGroupMembership({
        requiredGroupRole: 'Admin'
      })
    ],
    handler: async (req, res) => {
      const { 
        is_member, 
        sender_name, 
        group_name
      } = await SQL_SEND_INVITATION({
        group_id: Number(req.params.group_id),
        phone_number: req.body.phone_number,
        sender_id: req.user!.id
      }).one().catch((err) => {
        if (err.code === '23505') {
          throw new HttpError(409);
        }
        throw err;
      });

      const baseUrl = 'https://save-up-seven.vercel.app';
      const inviteLink = `${baseUrl}/notifications`;
      const signupLink = `${baseUrl}/sign-up?phone=${encodeURIComponent(req.body.phone_number)}`;
      
      const message = is_member
        ? `${sender_name} invited you to join a group ${group_name} on SaveUP. ` +
          `View your invite here: ${inviteLink}`
        : `${sender_name} invited you to join a group ${group_name} on SaveUP. ` +
          `Sign up here: ${signupLink} to join the group`;

      sendSms(req.body.phone_number, message);

      res.sendStatus(204);
    }
  });
};

export default createGroupInvite;