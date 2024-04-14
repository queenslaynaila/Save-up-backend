import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';
import { InviteInterface } from '../../types';

const SQL_FIND_INVITATIONS_FOR_USER = sql<{ receiver_id: number }, InviteInterface>(`
  SELECT * FROM invitations
  WHERE receiver_id = :receiver_id
`);

export default (router: Router) => {
  router.get<{ user_id: string }, InviteInterface[], Record<string, never>, Record<string, never>>(
    '/my-invites', 
    authMiddleware(),
    async (req, res) => {
      const user_id = req.user!.id;
      const invitations = await SQL_FIND_INVITATIONS_FOR_USER({ receiver_id: user_id }).many();
      return res.json(invitations);     
    }
  );
};
