import { sql } from '../../db';
import { Router } from 'express';
import authMiddleware from '../../middleware/authorization';
import  validateRequest from '../../middleware/validationMiddleware';
import { InviteResponseInterface, InviteValidationInterface, inviteValidationSchema } from './types';
import { 
  IdParamInterface, 
  idParamSchema, 
  StatusCodeInterface 
} from '../../globalTypes';

export interface ExtendedInviteResponseInterface extends InviteResponseInterface {
  xid: number;
}
const SQL_RESPOND_TO_INVITE = sql<ExtendedInviteResponseInterface, StatusCodeInterface>(`
   SELECT update_invite(:xid, :group_id, :receiver_id, :status)
`);

export default (router: Router) => {
  router.patch<IdParamInterface, StatusCodeInterface, InviteValidationInterface, 
  Record<string,never>>(
    '/:id',
    validateRequest({
      params: idParamSchema,
      body:inviteValidationSchema
    }),
    authMiddleware(),
    async (req, res) => {
      const xid  = parseInt(req.params.id);
      const  receiver_id = req.user!.id
      await SQL_RESPOND_TO_INVITE({ 
        ...req.body, 
        xid, 
        receiver_id 
      }).exec();
      res.sendStatus(204);
    }
  );
};