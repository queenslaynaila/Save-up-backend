import Router from '../../router';
import { sql } from '../../db';
import HttpError from '../../httpError';
import { z } from 'zod';
import { decodeEntityAndVerifyAccess } from '../../utils';
import { entityIdParamsSchema } from '../users/schema';

const SQL_DELETE_POCKET = sql<
  { 
    pocket_id: number; 
    entity_id: number 
  },
  Record<string, never>
>(`
  SELECT delete_pocket(:entity_id, :pocket_id)
`);

const deletePocket = (router: Router) => {
  router.route({
    method: 'delete',
    path: '/:entity_id/pockets/:xid',
    summary: 'Delete a pocket',
    request: {
      params: z.object({
        entity_id: entityIdParamsSchema,
        xid: z.number().int().min(1)      
      })
    },
    auth: true,
    handler: async (req, res) => {
      const entityId = await decodeEntityAndVerifyAccess(req, false, true);
      
      await SQL_DELETE_POCKET({
        entity_id: entityId,
        pocket_id: req.params.xid
      }).exec().catch(err => {
        if (err.code === 'P0006') {
          throw new HttpError(409, {
            message: 'ERR_CANT_DELETE_PKT_WITH_DEPOSITS'
          });
        }
      });

      res.sendStatus(204);
    }
  });
};

export default deletePocket;