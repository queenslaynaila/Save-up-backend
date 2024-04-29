import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { InviteInterface, GetInvitesInterface } from './types';

const SQL_FIND_INVITATIONS_FOR_USER = sql<GetInvitesInterface, InviteInterface>(`
  SELECT * FROM invitations
  WHERE receiver_id = :receiverId
`);

export default (router: Router) => {
  router.get<Record<string,never>, InviteInterface[], Record<string,never>, Record<string,never>>(
    '/my-invites', 
    authMiddleware(),
    async (req, res) => {
      const userId = req.user!.id;
      const invitations = await SQL_FIND_INVITATIONS_FOR_USER({ receiverId: userId }).many();
      return res.json(invitations);     
    }
  );
};
