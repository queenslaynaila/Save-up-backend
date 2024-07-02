import { sql } from '../../db';
import { Router } from 'express';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import { InviteResponseInterface, inviteValidationSchema } from './types';
import { StatusCodeInterface } from '../../globalTypes/index';

const SQL_RESPOND_TO_INVITE = sql<InviteResponseInterface, StatusCodeInterface>(`
   SELECT update_invite(:group_id, :receiver_id, :status)
`);

export default (router: Router) => {
  router.patch<{ id:string }, StatusCodeInterface, InviteResponseInterface, Record<string,never>, Record<string,never>>(
    '/:id',
    authMiddleware(),
    validateRequest(inviteValidationSchema),
    async (req, res) => {
      const group_id  = parseInt(req.params.id);
      const  receiver_id = req.user!.id
      await SQL_RESPOND_TO_INVITE({ status: req.body.status, group_id, receiver_id }).exec();
      res.sendStatus(204);
    }
  );
};