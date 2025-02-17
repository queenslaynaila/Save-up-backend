import Router from '../../router';
import { sql } from '../../db';
import HttpError from '../../httpError';
import { z } from 'zod';
import { SQL_GET_USER_PIN } from '../users/updateAttributes';
import bcrypt from 'bcrypt';

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
    path: '/transfer',
    summary: 'Create a transfer',
    request: {
      body: transferPayload.pick({
        source_pocket_id: true,
        destination_pocket_id: true,
        amount: true
      }).extend({
        pin: z.string().regex(/^\d{4}$/)
      }),
      query: z.object({
        group_id: z.string().regex(/^\d+$/).optional()
      })
    },
    response: {
      201: {}
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const { pin: currentPin } = await SQL_GET_USER_PIN({ id: req.user!.id }).one();

      const isValidPin = await bcrypt.compare(req.body.pin, currentPin);
      if (!isValidPin) {
        throw new HttpError(403, { message: 'Invalid PIN' });
      }
      const { source_pocket_id, destination_pocket_id, amount } = req.body;

      await SQL_CREATE_TRANSFER({
        source_pocket_id,
        destination_pocket_id,
        user_id: req.user!.id,
        amount,
        entity_id: Number(req.query.group_id) || req.user!.id
      }).exec().catch((err) => {
        if (err.code === 'P0004') {
          throw new HttpError(401, { message: 'ERR_NOT_ADMIN' });
        }
        if (err.code === 'P0005') {
          throw new HttpError(400, { message: 'ERR_FUNDS_LOCKED' });
        }
        if (err.code === 'P0004') {
          throw new HttpError(400, { message: 'ERR_INSUFFICIENT_FUNDS' });
        }
      });

      res.sendStatus(201);
    }
  });
};

export default createTransfer;