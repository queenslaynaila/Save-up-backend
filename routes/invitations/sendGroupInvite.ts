import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { SendInviteInterface, GroupIdParamInterface, GetUserByPhoneInterface } from './types';
import { MessageInterface } from '../../globalTypes/index';

const SQL_SEND_INVITATION = sql<SendInviteInterface, Record<string,never>>(`
  SELECT send_group_invite(:phone_number, :group_id, :sender_id)
`);

export default (router: Router) => {
  router.post<GroupIdParamInterface, MessageInterface, GetUserByPhoneInterface, Record<string,never>, Record<string,never>>(
    '/:groupId', 
    authMiddleware(),
    async (req, res) => {
      const user_id = req.user!.id;
      const  group_id  = parseInt(req.params.group_id); 
      const { phone_number } = req.body;
      await SQL_SEND_INVITATION({phone_number, group_id, sender_id:user_id })
        .exec()
      return res.json({ message: 'Invite sent successfully' });
    }
  );
};


  
