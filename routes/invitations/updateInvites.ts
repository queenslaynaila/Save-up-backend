import { sql } from '../../db';
import { Router } from 'express';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import { HttpError } from '../../middleware/errorMiddleware';
import { toTitleCase } from '../../middleware/caseNormalization';
import { InviteResponseInterface, inviteValidationSchema } from './types';
import { StatusCodeInterface } from '../../globalTypes/index';

const SQL_RESPOND_TO_INVITE = sql<InviteResponseInterface, StatusCodeInterface>(`
   SELECT update_invite(:group_id, :receiver_id, :status)
`);

const VALID_RESOURCES = ['Pending', 'Accept', 'Reject'];
export default (router: Router) => {
  router.patch<{ id:string }, StatusCodeInterface, InviteResponseInterface, Record<string,never>, Record<string,never>>(
    '/:id',
    authMiddleware(),
    validateRequest(inviteValidationSchema),
    async (req, res) => {
      const group_id  = parseInt(req.params.id);
      const  receiver_id = req.user!.id
      const { status } = req.body;
      const formattedStatus = toTitleCase(status) 
      if (!VALID_RESOURCES.includes(formattedStatus)) {
        throw new HttpError(
          400, 
          'INVALID_INPUT',
          {status: VALID_RESOURCES}
        );
      }
      await SQL_RESPOND_TO_INVITE({ group_id, receiver_id, status:formattedStatus }).exec();
      res.sendStatus(204);
    }
  );
};