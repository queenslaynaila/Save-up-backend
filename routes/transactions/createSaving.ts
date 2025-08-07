import Router from '../../core/router';
import { sql } from '../../db';
import { z } from 'zod';
import { decodeParamsAndAuthorizeAccess } from '../../decodeParamsAndAuthorizeAccess';
import { entityIdParamsSchema } from '../users/schema';

const SQL_CREATE_SAVING = sql<
{
  entity_id: number;
  amount: number;
  pocket_id: number;
  user_id: number;
},
Record<string, never>
>(`
  SELECT create_saving(
    :entity_id,
    :user_id,
    :pocket_id,
    :amount
  )
`);

const createSaving = (router: Router) => {
  router.post({
    path: '/:entity_id/transactions/deposits',
    summary: 'Deposit money to a pocket',
    auth: true,
    schema: {
      params: z.object({
        entity_id: entityIdParamsSchema
      }),
      body: z.object({
        amount: z.number().min(50),
        pocket_id: z.number().int().min(1)
      })
    },
    handler: async (req, res) => {
      const entityId = await decodeParamsAndAuthorizeAccess(req);

      await SQL_CREATE_SAVING({
        ...req.body,
        entity_id: entityId,
        user_id: req.user!.id
      }).exec();

      res.sendStatus(200);
    }
  });
};

export default createSaving;