import { sql } from '../../db';
import { Router } from 'express';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import { HttpError } from '../../middleware/errorMiddleware';
import { convertToTitleCase } from '../../middleware/caseNormalization';
import { InviteResponseInterface, InviteRequestInterface, inviteRequestSchema } from './types';
import { MessageInterface } from '../../globalTypes/index';

const SQL_RESPOND_TO_INVITE = sql<InviteResponseInterface, MessageInterface>(`
  UPDATE invitations
  SET status = :status
  WHERE receiver_id = :receiverId 
  AND group_id = :groupId
`);

const VALID_RESOURCES = ['Pending', 'Accepted', 'Rejected'];

export default (router: Router) => {
  router.patch<Record<string,never>, MessageInterface, InviteRequestInterface, Record<string,never>, Record<string,never>>(
    '/update-invite',
    authMiddleware(),
    validateRequest( inviteRequestSchema),
    async (req, res) => {
      const  receiverId = req.user!.id
      const { groupId,status } = req.body;
      const formattedStatus = status ? convertToTitleCase(status) : '';
      if (!VALID_RESOURCES.includes(formattedStatus)) {
        throw new HttpError(400, 'Invalid response');
      }
      await SQL_RESPOND_TO_INVITE({groupId, receiverId, status:formattedStatus}).exec();
      return res.json({ message: 'Invite response processed successfully' });
    }
  );
};
  