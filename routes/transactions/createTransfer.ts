import Router from '../../router';
import { sql } from '../../db';
import HttpError from '../../httpError';
import { z } from 'zod';
import verifyGroupMembership, { verifyPin } from '../../utils';

const transferPayload = z.object({
  entity_id: z.number().min(1),
  user_id: z.number().min(1),
  source_pocket_id: z.number().min(1),
  destination_pocket_id: z.number().min(1),
  amount: z.number().min(10)
});

type TransferPayload = z.infer<typeof transferPayload>;

const SQL_CREATE_TRANSFER = sql<TransferPayload, Record<string, never>>(`
  SELECT create_transfer(
    :source_pocket_id, 
    :destination_pocket_id, 
    :user_id, 
    :amount,
    :entity_id
  )
`);

const createTransfer = (router: Router) => {
  router.route({
    method: 'post',
    path: '/:entity_id/:source_pocket_id/transfer/:destination_pocket_id',
    summary: 'Transfer money between pockets',
    request: {
      params: z.object({
        entity_id: z.union([
          z.string().regex(/^[1-9]\d*$/),
          z.literal("me")
        ]).default('me'),
        source_pocket_id: z.string().regex(/^[1-9]\d*$/),
        destination_pocket_id: z.string().regex(/^[1-9]\d*$/)
      }),
      body: transferPayload.pick({
        amount: true
      }).extend({
        pin: z.string().regex(/^\d{4}$/)
      })
    },
    authMiddlewareOptions: {},
    middlewares: [
      verifyPin, 
      verifyGroupMembership({ requiredGroupRole: 'Admin' })
    ],
    handler: async (req, res) => {
      const sourcePocketId = Number(req.params.source_pocket_id);
      const destinationPocketId = Number(req.params.destination_pocket_id);

      await SQL_CREATE_TRANSFER({
        source_pocket_id: sourcePocketId,
        destination_pocket_id: destinationPocketId,
        user_id: req.user!.id,
        amount: req.body.amount,
        entity_id: Number(req.params.entity_id)
      }).exec().catch((err) => {
        if (err.code === 'P0004') {
          throw new HttpError(401, { 
            message: 'ERR_NOT_ADMIN' 
          });
        }
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