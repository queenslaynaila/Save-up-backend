import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { SendInviteInterface, GroupIdParamInterface, GetUserByPhoneInterface, FindPendingInviteInterface, CountInviteInterface } from './types';
import { MessageInterface, IdInterface } from '../../globalTypes/index';

const SQL_FIND_USER_BY_PHONE = sql<GetUserByPhoneInterface, IdInterface>(`
  SELECT id 
  FROM user_contact_details 
  WHERE phone_number = :phoneNumber
`);

const SQL_FIND_PENDING_INVITATION = sql<FindPendingInviteInterface, CountInviteInterface>(`
  SELECT COUNT(*) AS count 
  FROM invitations
  WHERE receiver_id = :receiverId 
  AND group_id = :groupId 
  AND status = 'Pending'
`);

const SQL_SEND_INVITATION = sql<SendInviteInterface, Record<string,never>>(`
  INSERT INTO invitations ( group_id, receiver_id, sender_id)
  VALUES(:groupId, :receiverId, :senderId) 
  RETURNING *
`);

export default (router: Router) => {
  router.post<GroupIdParamInterface, MessageInterface, GetUserByPhoneInterface, Record<string,never>, Record<string,never>>(
    '/:groupId', 
    authMiddleware(),
    async (req, res) => {
      const userId = req.user!.id;
      const  groupId  = parseInt(req.params.groupId); 
      const { phoneNumber } = req.body;
      const receiver = await SQL_FIND_USER_BY_PHONE({ phoneNumber }).oneOrNull();
      if (!receiver) {
        throw new HttpError(404, 'User not found');
      }
      const pendingInvitation = await SQL_FIND_PENDING_INVITATION({ receiverId: receiver.id, groupId: groupId }).one();
      if (pendingInvitation && pendingInvitation.count > 0) {
        throw new HttpError(400, 'User already has a pending invitation for this group');
      }
      await SQL_SEND_INVITATION({ groupId: groupId, receiverId: receiver.id, senderId: userId })
        .exec()
      return res.json({ message: 'Invite sent successfully' });
    }
  );
};


  
