import Router from '../../router';
import { sql } from '../../db';
import HttpError from '../../httpError';
import { z } from 'zod';
import logger from '../../logger';

const transferPayload = z.object({
  user_id: z.number(),
  source_pocket_id: z.number(),
  destination_pocket_id: z.number(),
  amount: z.number()
});

type TransferPayload = z.infer<typeof transferPayload>;

const SQL_CREATE_TRANSFER = sql<TransferPayload, Record<string, never>>(`
  SELECT create_transfer(
    :source_pocket_id, 
    :destination_pocket_id, 
    :user_id, 
    :amount
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
      })
    },
    response: {
      201: {}
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const { source_pocket_id, destination_pocket_id, amount } = req.body;
      logger.info(`this is the body ${JSON.stringify(req.body)} by user ${req.user!.id}`);
      await SQL_CREATE_TRANSFER({
        source_pocket_id,
        destination_pocket_id,
        user_id: req.user!.id,
        amount
      }).exec().catch((err) => {
        if (err.code === 'P0004') {
          throw new HttpError(400, { message: 'ERR_INSUFFICIENT_FUNDS' });
        }
      });
      logger.info('query complete');
      res.sendStatus(201);
    }
  });
};

export default createTransfer;