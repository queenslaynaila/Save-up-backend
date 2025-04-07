import Router from '../../router';
import { sql } from '../../db';
import HttpError from '../../httpError';
import { z } from 'zod';
import { decodeEntityAndVerifyAccess } from '../../utils';
import { entityIdParamsSchema } from '../users/schema';

const SQL_GET_BALANCE =  sql<
{ pocket_id: number, entity_id: number }, { balance:number }
>(`
  SELECT COALESCE(
    (
      SELECT balance
      FROM transactions
      WHERE pocket_id = :pocket_id  
        AND entity_id = :entity_id
      ORDER BY xid DESC
      LIMIT 1
    ), 0) AS balance;
`);

const SQL_DELETE_POCKET = sql<
    { pocket_id: number; entity_id: number },
    Record<string, never>
>(`
   UPDATE pockets
    SET deleted_at = NOW()
    WHERE xid = :pocket_id
      AND entity_id = :entity_id
      AND deleted_at IS NULL;
`);


const deletePocket = (router: Router) => {
  router.route({
    method: 'delete',
    path: '/:entity_id/pockets/:xid',
    summary: 'Delete a pocket',
    schema: {
      params: z.object({
        entity_id: entityIdParamsSchema,
        xid: z.number().int().min(1)
      })
    },
    auth: true,
    handler: async (req, res) => {
      const entityId = await decodeEntityAndVerifyAccess(req, false, true);

      await sql.transaction(async (trx) => {
        const balance = await SQL_GET_BALANCE({
          entity_id: entityId,
          pocket_id: req.params.xid
        }).using(trx).oneFirst();

        if (balance > 0) {
          throw new HttpError(409, {
            message: 'ERR_CANT_DELETE_PKT_WITH_BALANCE'
          });
        }

        await SQL_DELETE_POCKET({
          entity_id: entityId,
          pocket_id: req.params.xid
        }).using(trx).exec();
      })
      res.sendStatus(204);
    }
  });
};

export default deletePocket;