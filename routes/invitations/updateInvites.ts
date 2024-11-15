import { sql } from '../../db';
import Router from '../../router';
import authMiddleware from '../../middleware/authorization';
import { InviteResponseInterface, inviteValidationSchema } from './types';
import { idParamSchema, StatusCodeInterface } from '../../globalTypes';

export interface ExtendedInviteResponseInterface extends InviteResponseInterface {
  xid: number;
}
const SQL_RESPOND_TO_INVITE = sql<ExtendedInviteResponseInterface, StatusCodeInterface>(`
   SELECT update_invite(:xid, :group_id, :receiver_id, :status)
`);

const updateInvites = (router: Router) => {
  router.route({
    method: 'patch',
    path: '/:id',
    summary: 'Update an invitation',
    schema: {
      params: idParamSchema,
      body: inviteValidationSchema
    },
    response: {
      statusCode: 204
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      const xid = Number(req.params.id);
      const receiver_id = req.user!.id;
      await SQL_RESPOND_TO_INVITE({
        ...req.body,
        xid,
        receiver_id
      }).exec();
      res.sendStatus(204);
    }
  });
};

export default updateInvites;