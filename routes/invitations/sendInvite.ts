import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import {
  InviteInputInterface,
  UserInviteInterface,
  userInviteSchema
} from './types';
import { StatusCodeInterface } from '../../globalTypes';
import validateRequest from '../../middleware/validationMiddleware';

const SQL_CHECK_USER_EXISTENCE = sql<{ phone_number: string }, { exists: boolean }>(`
  SELECT EXISTS (
    SELECT 1 FROM user_contact_details 
    WHERE phone_number = :phone_number
  ) AS exists
`);

const SQL_SEND_INVITATION = sql<InviteInputInterface, Record<string, never>>(`
  SELECT send_invite( :group_id, :phone_number, :sender_id)
`);

export default (router: Router) => {
  router.post<Record<string, never>, StatusCodeInterface, UserInviteInterface,
  Record<string, never>>(
    '/',
    validateRequest({
      body: userInviteSchema
    }),
    authMiddleware(),
    async (req, res) => {
      const { exists } = await SQL_CHECK_USER_EXISTENCE({
        phone_number: req.body.phone_number
      }).one();

      if (!exists) {
        res.sendStatus(404);
        return;
      }

      await SQL_SEND_INVITATION({
        ...req.body, sender_id: req.user!.id
      }).exec();
      res.sendStatus(204);
    }
  );
};