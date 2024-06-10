import { sql } from '../../db';
import { Router } from 'express';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import { HttpError } from '../../middleware/errorMiddleware';
import { convertToTitleCase } from '../../middleware/caseNormalization';
import { InviteResponseInterface, InviteRequestInterface, inviteRequestSchema } from './types';
import { StatusCodeInterface } from '../../globalTypes/index';

const SQL_RESPOND_TO_INVITE = sql<InviteResponseInterface, StatusCodeInterface>(`
   SELECT update_invites(:group_id, :receiver_id, :status)
`);

const VALID_RESOURCES = ['Pending', 'Accepted', 'Rejected'];

export default (router: Router) => {
  router.patch<{ id:string }, StatusCodeInterface, InviteRequestInterface, Record<string,never>, Record<string,never>>(
    '/:id',
    authMiddleware(),
    validateRequest( inviteRequestSchema),
    async (req, res) => {
      const group_id  = parseInt(req.params.id);
      const  receiver_id = req.user!.id
      const { status } = req.body;
      const formattedStatus = convertToTitleCase(status) 
      if (!VALID_RESOURCES.includes(formattedStatus)) {
        throw new HttpError(400, 'Invalid response type');
      }
      await SQL_RESPOND_TO_INVITE({ group_id, receiver_id, status:formattedStatus }).exec();
      res.sendStatus(204);
    }
  );
};