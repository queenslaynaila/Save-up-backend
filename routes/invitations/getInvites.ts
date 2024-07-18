import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { baseInviteInterface, InviteByReceiverInterface } from './types';

const SQL_GET_PENDING_INVITATIONS = sql<InviteByReceiverInterface, baseInviteInterface>(`
  SELECT 
    i.sender_id,
    i.group_id,
    u.full_name AS sender_name,
    g.name AS group_name,
    i.created_at
  FROM invitations i
  JOIN groups g ON i.group_id = g.id
  JOIN user_contact_details u ON i.sender_id = u.id
  WHERE i.receiver_id = :receiver_id
  AND i.status = 'Pending';
`);

export default (router: Router) => {
  router.get<Record<string,never>, baseInviteInterface[], Record<string,never>, 
  Record<string,never>>(
    '/', 
    authMiddleware(),
    async (req, res) => {
      const invitations = await  SQL_GET_PENDING_INVITATIONS({ 
        receiver_id: req.user!.id 
      }).many();
      return res.json(invitations);     
    }
  );
};