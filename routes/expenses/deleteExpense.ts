import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import verifyGroupMembership from '../../utils';

const SQL_DELETE_EXPENSE = sql<{xid:number, entity_id:number}, Record<string, never>>(`
  UPDATE expenses
  SET deleted_at = NOW()
  WHERE xid = :xid
  AND entity_id = :entity_id
  AND deleted_at IS NULL
`);

const deleteExpense = (router: Router) => {
  router.route({
    method: 'delete',
    path: '/:entity_id/:xid',
    summary: 'Delete an expense',
    request: {
      params: z.object({
        entity_id: z.union([
          z.string().regex(/^[1-9]\d*$/, "Must be a positive integer string"),
          z.literal("me"), 
        ]).default('me' ),
        xid: z.string().min(1)
      }),
      query: z.object({
        entity_id: z.string().min(1).optional()
      })
    },
    response: {
      204: {}
    },
    authMiddlewareOptions: {},
    middlewares: [verifyGroupMembership({requiredGroupRole: 'Admin'})],
    handler: async (req, res) => {
      const entity_id = Number(req.params.entity_id);
      await SQL_DELETE_EXPENSE({
        xid: Number(req.params.xid),
        entity_id
      }).exec();
      res.sendStatus(204);
    }
  });
};

export default deleteExpense;