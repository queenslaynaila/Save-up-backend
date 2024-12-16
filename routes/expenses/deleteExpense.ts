import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';

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
    path: '/:id',
    summary: 'Delete an expense',
    request: {
      params: z.object({
        id: z.string().min(1)
      }),
      query: z.object({
        entity_id: z.number().min(1).optional()
      })
    },
    response: {
      204: {}
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const entity_id = Number(req.query?.entity_id) ?? req.user!.id;
      await SQL_DELETE_EXPENSE({
        xid: Number(req.params.id),
        entity_id
      }).exec();
      res.sendStatus(204);
    }
  });
};

export default deleteExpense;