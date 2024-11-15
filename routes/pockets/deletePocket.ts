import Router from '../../router';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { entitySchema, idParamSchema } from '../../globalTypes';
import { HttpError } from '../../middleware/errorMiddleware';

const SQL_DELETE_POCKET = sql<{pocket_id: number, entity_id: number}, Record<string, never>>(`
  SELECT delete_pocket(:entity_id, :pocket_id)
`);

const deletePocket = (router: Router) => {
  router.route({
    method: 'delete',
    path: '/:id',
    summary: 'Delete a pocket',
    schema: {
      params: idParamSchema,
      body: entitySchema
    },
    response: {
      statusCode: 204
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      const entity_id = req.body?.entity_id ?? req.user!.id;
      await SQL_DELETE_POCKET({
        entity_id,
        pocket_id: Number(req.params.id)
      }).exec().catch(err => {
        if (err.code === 'P0006') {
          throw new HttpError(409);
        }
      });
      res.sendStatus(204);
    }
  });
};

export default deletePocket;