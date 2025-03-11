import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import sendSms from '../../services/sms';
import verifyGroupMembership from '../../utils';
import HttpError from '../../httpError';
import logger from '../../logger';

const SQL_SEND_INVITATION = sql<
  {
    group_id: number;
    sender_id: number;
    phone_number: string;
  },
  {
    receiver_id: number | null;
    sender_name: string;
    group_name: string;
  }
>(`
  INSERT INTO invitations (
    group_id,
    xid,
    sender_id,
    receiver_id,
    phone_number
  )
  SELECT 
    :group_id,
    COALESCE(MAX(xid), 0) + 1,
    :sender_id,
    (
      SELECT id 
      FROM user_contact_details 
      WHERE phone_number = :phone_number
    ),
    :phone_number
  FROM invitations
  WHERE group_id = :group_id
  RETURNING 
    (SELECT name FROM groups WHERE id = :group_id) AS group_name,
    (SELECT full_name FROM user_contact_details WHERE id = :sender_id) AS sender_name,
    receiver_id
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
        group_id: z.string()
          .regex(/^[1-9]\d*$/)
      }),
      body: z.object({
        phone_number: z.string()
          .regex(/^\+\d{1,4}\d{9}$/)
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
        receiver_id, 
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
      const signupLink = `${baseUrl}/sign-up?phone=${
        encodeURIComponent(req.body.phone_number)
      }`;

      logger.info(`receiver_id: ${receiver_id}`);
      logger.info(`sender_name: ${sender_name}`);
      logger.info(`group_name: ${group_name}`);

      const baseMessage = 
        `${sender_name} invited you to join group ${group_name} on SaveUP.`;
      const message = receiver_id === null
        ? `${baseMessage} Sign up here: ${signupLink} to join the group`
        : `${baseMessage} View your invite here: ${inviteLink}`;

      sendSms(req.body.phone_number, message);

      res.sendStatus(204);
    }
  });
};

export default createGroupInvite;