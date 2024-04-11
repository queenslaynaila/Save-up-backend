import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';
import { HttpError } from '../../middleware/errorMiddleware';
import { SendInviteInterface } from '../../types';

const SQL_FIND_USER_BY_PHONE = sql<{ phone_number: string }, { receiver_id: number }>(`
    SELECT user_id FROM user_contacts WHERE phone_number = :phone_number
`);

const SQL_SEND_INVITATION = sql<SendInviteInterface, Record<string, never>>(`
  INSERT INTO invitations ( group_id, receiver_id, sender_id)
  VALUES(:group_id, :receiver_id, :sender_id) 
`);

export default (router: Router) => {
  router.post<Record<string, never>, { message: string }, SendInviteInterface & { phone_number: string }, Record<string, never>, Record<string, never>>(
    '/:groupId', 
    authMiddleware(),
    async (req, res) => {
      const user_id = req.user!.id;
      const { groupId } = req.params; 
      const { phone_number } = req.body;
      const receiver_id = await SQL_FIND_USER_BY_PHONE({ phone_number }).oneOrNull();
      if (!receiver_id ) {
        throw new HttpError(404, 'User with this phone number not found. You can invite them to join the app and connect with you');
      } else {
        await SQL_SEND_INVITATION({ group_id: groupId, receiver_id: receiver_id.receiver_id, sender_id: user_id })
          .one(new HttpError(404, 'User already has a pending invitation for this group'));
        return res.json({ message: 'Invite sent successfully' });
      }
    }
  );
};

  
