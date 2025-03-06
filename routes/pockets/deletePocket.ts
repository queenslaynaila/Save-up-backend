import Router from '../../router';
import { sql } from '../../db';
import HttpError from '../../httpError';
import { z } from 'zod';
import verifyGroupMembership from '../../utils';

const SQL_DELETE_POCKET = sql<{pocket_id: number, entity_id: number}, Record<string, never>>(`
  SELECT delete_pocket(:entity_id, :pocket_id)
`);

const deletePocket = (router: Router) => {
  router.route({
    method: 'delete',
    path: '/:entity_id/:xid',
    summary: 'Delete a pocket',
    request: {
      params: z.object({
        entity_id: z.union([
          z.string().regex(/^[1-9]\d*$/, "Must be a positive integer string"),
          z.literal("me"), 
        ]).default('me' ),
        xid: z.string().min(1)
      }),
      body: z.object({ entity_id: z.number() }).partial()
    },
    authMiddlewareOptions: {},
    middlewares: [verifyGroupMembership()],
    handler: async (req, res) => {
      await SQL_DELETE_POCKET({
        entity_id:Number(req.params.entity_id),
        pocket_id: Number(req.params.xid)
      }).exec().catch(err => {
        if (err.code === 'P0006') {
          throw new HttpError(409, { message: 'ERR_CANT_DELETE_PKT_WITH_DEPOSITS' });
        }
      });
      res.sendStatus(204);
    }
  });
};

export default deletePocket;