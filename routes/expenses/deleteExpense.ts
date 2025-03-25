import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import { decodeEntityAndVerifyAccess } from '../../utils';
import { entityIdParamsSchema } from '../users/schema';

const SQL_DELETE_EXPENSE = sql<
{xid:number, entity_id:number}, 
Record<string, never>>(`
  UPDATE expenses
  SET deleted_at = NOW()
  WHERE xid = :xid
  AND entity_id = :entity_id
  AND deleted_at IS NULL
`);

const deleteExpense = (router: Router) => {
  router.route({
    method: 'delete',
    path: '/:entity_id/expenses/:xid',
    summary: 'Delete an expense',
    request: {
      params: z.object({
        entity_id: entityIdParamsSchema,
        xid: z.number().int().min(1)
      })
    },
    auth: true,
    handler: async (req, res) => {
      const entityId =  await decodeEntityAndVerifyAccess(req);
      await SQL_DELETE_EXPENSE({
        xid: req.params.xid,
        entity_id: entityId
      }).exec();
      res.sendStatus(204);
    }
  });
};

export default deleteExpense;