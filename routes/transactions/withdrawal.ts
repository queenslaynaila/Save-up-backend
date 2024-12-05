import { sql } from '../../db';
import HttpError from '../../httpError';
import logger from '../../logger';
import Router from '../../router';
import { z } from 'zod';

const withdrawalPayload = z.object({
  pocket_id: z.number(),
  amount: z.number(),
  user_id: z.number()
});

type Withdrawal = z.infer<typeof withdrawalPayload>

const SQL_CREATE_WITHDRAWAL = sql<Withdrawal, Record<string, never>>(`
  SELECT create_withdrawal(:user_id, :pocket_id, :amount);
`);

const createWithdrawal = (router: Router) => {
  router.route({
    method: 'post',
    path: '/withdraw',
    summary: 'Withdraw from a pocket',
    schema: {
      body: withdrawalPayload.pick({
        pocket_id: true,
        amount: true
      })
    },
    response: {
      statusCode: 201
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      logger.info(`withdrwal req made by user ${req.user!.id}`);
      await SQL_CREATE_WITHDRAWAL({
        ...req.body,
        user_id: req.user!.id
      }).exec().catch((err) => {
        if (err.code === 'P0004') {
          throw new HttpError(400, { message: 'ERR_INSUFFICIENT_FUNDS' });
        }
        if (err.code === 'P0005') {
          throw new HttpError(400, { message: 'ERR_FUNDS_LOCKED' });
        }
      });
      res.sendStatus(201);
    }
  });
};

export default createWithdrawal;