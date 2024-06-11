import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { baseInviteInterface, InviteByReceiverInterface } from './types';

const SQL_FIND_INVITATIONS_FOR_USER = sql<InviteByReceiverInterface, baseInviteInterface>(`
  SELECT invitations.group_id, 
         invitations.sender_id,
         (SELECT full_name FROM users WHERE id = invitations.sender_id) AS sender_name,
         (SELECT name FROM groups WHERE id = invitations.group_id) AS group_name,
         invitations.created_at
  FROM invitations
  WHERE invitations.receiver_id = :receiver_id;
`);

export default (router: Router) => {
  router.get<Record<string,never>, baseInviteInterface[], InviteByReceiverInterface, Record<string,never>>(
    '/', 
    authMiddleware(),
    async (req, res) => {
      const invitations = await SQL_FIND_INVITATIONS_FOR_USER({ receiver_id: req.user!.id }).many();
      return res.json(invitations);     
    }
  );
};