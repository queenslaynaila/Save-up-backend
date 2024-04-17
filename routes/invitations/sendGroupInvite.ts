import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { SendInviteInterface } from '../../types';

const SQL_FIND_USER_BY_PHONE = sql<{ phone_number: string }, { id: number }>(`
    SELECT id FROM user_contacts WHERE phone_number = :phone_number
`);

const SQL_FIND_PENDING_INVITATION = sql<{ receiver_id: number, group_id: number }, { count: number }>(`
  SELECT COUNT(*) AS count FROM invitations
  WHERE receiver_id = :receiver_id AND group_id = :group_id AND status = 'Pending'
`);

const SQL_SEND_INVITATION = sql<SendInviteInterface, Record<string,never>>(`
  INSERT INTO invitations ( group_id, receiver_id, sender_id)
  VALUES(:group_id, :receiver_id, :sender_id) 
  RETURNING *
`);

export default (router: Router) => {
  router.post<{ groupId: string }, { message: string }, { phone_number: string }, Record<string,never>, Record<string,never>>(
    '/:groupId', 
    authMiddleware(),
    async (req, res) => {
      const user_id = req.user!.id;
      const  groupId  = parseInt(req.params.groupId); 
      const { phone_number } = req.body;
      const receiver = await SQL_FIND_USER_BY_PHONE({ phone_number }).oneOrNull();
      if (!receiver) {
        throw new HttpError(404, 'c');
      }
      const pendingInvitation = await SQL_FIND_PENDING_INVITATION({ receiver_id: receiver.id, group_id: groupId }).one();
      if (pendingInvitation && pendingInvitation.count > 0) {
        throw new HttpError(400, 'User already has a pending invitation for this group');
      }
      await SQL_SEND_INVITATION({ group_id: groupId, receiver_id: receiver.id, sender_id: user_id })
        .exec()
      return res.json({ message: 'Invite sent successfully' });
    }
  );
};


  
