import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { ReceivedInviteInterface } from './types';

const SQL_FIND_INVITATIONS_FOR_USER = sql<{ receiver_id: number }, ReceivedInviteInterface>(`
  SELECT * FROM invitations
  WHERE receiver_id = :receiver_id
`);

export default (router: Router) => {
  router.get<Record<string,never>, ReceivedInviteInterface[], Record<string,never>, Record<string,never>>(
    '/', 
    authMiddleware(),
    async (req, res) => {
      const userId = req.user!.id;
      const invitations = await SQL_FIND_INVITATIONS_FOR_USER({ receiver_id: userId }).many();
      return res.json(invitations);     
    }
  );
};
