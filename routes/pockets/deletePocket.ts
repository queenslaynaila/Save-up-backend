import Router from '../../router';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { z } from 'zod';

const SQL_DELETE_POCKET = sql<{pocket_id: number, entity_id: number}, Record<string, never>>(`
  SELECT delete_pocket(:entity_id, :pocket_id)
`);

const deletePocket = (router: Router) => {
  router.route({
    method: 'delete',
    path: '/:id',
    summary: 'Delete a pocket',
    security: [{ 'authorization-token': [] }],
    schema: {
      params: z.object({ id: z.string() }),
      body: z.object({ entity_id: z.number() }).partial()
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
          throw new HttpError(409, { message: 'ERR_CANT_DELETE_PKT_WITH_DEPOSITS' });
        }
      });
      res.sendStatus(204);
    }
  });
};

export default deletePocket;