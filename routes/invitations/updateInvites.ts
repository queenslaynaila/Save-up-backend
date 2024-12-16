import { z } from 'zod';
import { sql } from '../../db';
import Router from '../../router';
import { InviteResponseInterface, inviteValidationSchema } from './types';

interface ExtendedInviteResponseInterface extends InviteResponseInterface {
  xid: number;
}
const SQL_RESPOND_TO_INVITE = sql<ExtendedInviteResponseInterface, Record<string, never>>(`
   SELECT update_invite(:xid, :group_id, :receiver_id, :status)
`);

const updateInvites = (router: Router) => {
  router.route({
    method: 'patch',
    path: '/:id',
    summary: 'Respond to a group invitation',
    request: {
      params: z.object({
        id: z.string()
      }),
      body: inviteValidationSchema
    },
    response: {
      204: {}
    },
    authMiddlewareOptions: {},
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