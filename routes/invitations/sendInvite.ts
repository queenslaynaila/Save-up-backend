import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { SendInviteInterface } from './types';
import { StatusCodeInterface } from '../../globalTypes/index';

const SQL_SEND_INVITATION = sql<SendInviteInterface, Record<string,never>>(`
  SELECT send_invite(:phone_number, :group_id, :sender_id)
`);

export default (router: Router) => {
  router.post<Record<string,never>, StatusCodeInterface, SendInviteInterface, Record<string,never>, Record<string,never>>(
    '/', 
    authMiddleware(),
    async (req, res) => {
      await SQL_SEND_INVITATION({...req.body, sender_id:req.user!.id })
        .exec()
      res.sendStatus(201);
    }
  );
};