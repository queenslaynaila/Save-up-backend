import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import {  InviteInputInterface } from './types';
import { StatusCodeInterface } from '../../globalTypes/index';

const SQL_SEND_INVITATION = sql<InviteInputInterface, Record<string,never>>(`
  SELECT send_invite( :group_id, :phone_number, :sender_id)
`);

export default (router: Router) => {
  router.post<Record<string,never>, StatusCodeInterface, InviteInputInterface, 
  Record<string,never>>(
    '/', 
    authMiddleware(),
    async (req, res) => {
      await SQL_SEND_INVITATION({
        ...req.body, sender_id:req.user!.id 
      }).exec()
      res.sendStatus(204);
    }
  );
};