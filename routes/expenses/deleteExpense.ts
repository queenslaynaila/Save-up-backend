import Router from '../../router';
import { sql } from '../../db';

import { XidEntityInterface, idParamSchema, entitySchema } from '../../types';

const SQL_DELETE_EXPENSE = sql<XidEntityInterface, Record<string, never>>(`
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
    schema: {
      params: idParamSchema,
      body: entitySchema
    },
    response: {
      statusCode: 204
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const entity_id = req.body?.entity_id ?? req.user!.id;
      await SQL_DELETE_EXPENSE({
        xid: Number(req.params.id),
        entity_id
      }).exec();
      res.sendStatus(204);
    }
  });
};

export default deleteExpense;