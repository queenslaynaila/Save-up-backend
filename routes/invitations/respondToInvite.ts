import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';
import { validateRequest } from '../../middleware/validationMiddleware';
import { HttpError } from '../../middleware/errorMiddleware';
import { convertToTitleCase } from '../../middleware/caseNormalization';
import { InviteResponseInterface, InviteResponseSchema } from '../../types';

const SQL_RESPOND_TO_INVITE = sql<InviteResponseInterface, { message:string }>(`
  UPDATE invitations
  SET status = :status
  WHERE receiver_id = :receiver_id AND group_id = :group_id
`);

const VALID_RESOURCES = ['Pending', 'Accepted', 'Rejected'];

export default (router: Router) => {
  router.patch<Record<string, never>,{ message:string },InviteResponseInterface, Record<string,never>, Record<string, never>>(
    '/update-invite',
    authMiddleware(),
    validateRequest(InviteResponseSchema),
    async (req, res) => {
      const  receiver_id = req.user!.id
      const { group_id,status} = req.body;
      const formattedStatus = status ? convertToTitleCase(status) : '';
      if (!VALID_RESOURCES.includes(formattedStatus)) {
        throw new HttpError(400, 'Invalid resource');
      }
      await SQL_RESPOND_TO_INVITE({group_id, receiver_id,status:formattedStatus}).exec();
      return res.json({ message: 'Invite response processed successfully' });
    }
  );
};
  