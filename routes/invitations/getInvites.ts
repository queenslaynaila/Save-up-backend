import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { baseInviteInterface, InviteByReceiverInterface } from './types';

const SQL_FIND_INVITATIONS_FOR_USER = sql<InviteByReceiverInterface, baseInviteInterface>(`
  SELECT * FROM get_invitations_for_user(:receiver_id)
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