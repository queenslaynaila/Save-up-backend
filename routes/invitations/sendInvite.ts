import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import {  
  InviteInputInterface, 
  UserInviteInterface, 
  userInviteSchema 
} from './types';
import { headersSchema, StatusCodeInterface } from '../../globalTypes/index';
import validateRequest from '../../middleware/validationMiddleware';

const SQL_SEND_INVITATION = sql<InviteInputInterface, Record<string,never>>(`
  SELECT send_invite( :group_id, :phone_number, :sender_id)
`);

export default (router: Router) => {
  router.post<Record<string,never>, StatusCodeInterface, UserInviteInterface, 
  Record<string,never>>(
    '/', 
    validateRequest({ 
      headers: headersSchema, 
      body:userInviteSchema
    }),
    authMiddleware(),
    async (req, res) => {
      await SQL_SEND_INVITATION({
        ...req.body, sender_id:req.user!.id 
      }).exec()
      res.sendStatus(204);
    }
  );
};