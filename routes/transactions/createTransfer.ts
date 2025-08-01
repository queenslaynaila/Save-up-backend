import Router from '../../core/router';
import { sql } from '../../db';
import HttpError from '../../httpError';
import { z } from 'zod';
import { decodeEntityAndVerifyAccess, verifyPin } from '../../utils';
import { entityIdParamsSchema } from '../users/schema';

const transferPayload = z.object({
  entity_id: z.number().min(1),
  user_id: z.number().min(1),
  source_pocket_id: z.number().min(1),
  destination_pocket_id: z.number().min(1),
  amount: z.number().min(10)
});

type TransferPayload = z.infer<typeof transferPayload>;

const SQL_CREATE_TRANSFER = sql<
Pick<TransferPayload, 'entity_id'|'user_id'|
'source_pocket_id'|'destination_pocket_id'|'amount'>,
Record<string, never>
>(`
  SELECT create_transfer(
    :source_pocket_id,
    :destination_pocket_id,
    :user_id,
    :amount,
    :entity_id
  )
`);

const createTransfer = (router: Router) => {
  router.post({
    path: '/:entity_id/transactions/transfers',
    summary: 'Transfer money between pockets',
    auth: true,
    schema: {
      params: z.object({
        entity_id: entityIdParamsSchema
      }),
      body: transferPayload
        .pick({
          amount: true,
          source_pocket_id: true,
          destination_pocket_id: true
        })
        .extend({
          pin: z.string().regex(/^\d{4}$/)
        })
    },
    middlewares: [verifyPin],
    handler: async (req, res) => {
      const entityId = await decodeEntityAndVerifyAccess(req, false, true);

      await SQL_CREATE_TRANSFER({
        ...req.body,
        user_id: req.user!.id,
        entity_id: entityId
      }).exec().catch(err => {
        if (err.code === 'P0005') {
          throw new HttpError(400, {
            message: 'ERR_FUNDS_LOCKED'
          });
        }
        if (err.code === 'P0004') {
          throw new HttpError(400, {
            message: 'ERR_INSUFFICIENT_FUNDS'
          });
        }
      });

      res.sendStatus(200);
    }
  });
};

export default createTransfer;