import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { baseInviteInterface, InviteByReceiverInterface } from './types';
import validateRequest from '../../middleware/validationMiddleware';
import { headersSchema } from '../../globalTypes';

const SQL_GET_PENDING_INVITATIONS = sql<InviteByReceiverInterface, baseInviteInterface>(`
  SELECT * FROM get_user_invites(:receiver_id)
`);

export default (router: Router) => {
  router.get<Record<string,never>, baseInviteInterface[], Record<string,never>, 
  Record<string,never>>(
    '/', 
    validateRequest({ 
      headers: headersSchema, 
    }),
    authMiddleware(),
    async (req, res) => {
      const invitations = await  SQL_GET_PENDING_INVITATIONS({ 
        receiver_id: req.user!.id 
      }).many();
      return res.json(invitations);     
    }
  );
};