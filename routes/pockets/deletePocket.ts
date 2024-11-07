import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import {
  EntityInterface,
  entitySchema,
  IdParamInterface,
  idParamSchema,
  StatusCodeInterface
} from '../../globalTypes';
import validateRequest from '../../middleware/validationMiddleware';
import { HttpError } from '../../middleware/errorMiddleware';

const SQL_DELETE_POCKET = sql<{pocket_id: number, entity_id: number}, Record<string, never>>(`
  SELECT delete_pocket(:entity_id, :pocket_id)
`);

export default (router: Router) => {
  router.delete<IdParamInterface, StatusCodeInterface, EntityInterface,
  Record<string, never>>(
    '/:id',
    validateRequest({
      params: idParamSchema,
      body: entitySchema
    }),
    authMiddleware(),
    async (req, res) => {
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
  );
};