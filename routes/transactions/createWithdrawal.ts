import { sql } from '../../db';
import HttpError from '../../httpError';
import Router from '../../router';
import { z } from 'zod';
import { verifyPin } from '../../utils';
import { userIdParamsSchema } from '../users/schema';

const withdrawalPayload = z.object({
  pocket_id: z.number().min(1),
  amount: z.number().min(50),
  user_id: z.number()
});

type Withdrawal = z.infer<typeof withdrawalPayload>

const SQL_CREATE_WITHDRAWAL = sql<Withdrawal, Record<string, never>>(`
  SELECT withdraw_from_user_pocket(:user_id, :pocket_id, :amount);
`);

const createWithdrawal = (router: Router) => {
  router.route({
    method: 'post',
    path: '/:user_id/:pocket_id/withdraw',
    summary: 'Withdraw from a user pocket',
    request: {
      params: userIdParamsSchema.extend({
        pocket_id: z.string().regex(/^[1-9]\d*$/)
      }),
      body: withdrawalPayload.pick({
        amount: true
      }).extend({
        pin: z.string().regex(/^\d{4}$/)
      })
    },
    response: {
      201: {}
    },
    auth: true,
    middlewares: [verifyPin],
    handler: async (req, res) => {
      const userId = Number(req.params.user_id);
      const pocketId = Number(req.params.pocket_id);

      await SQL_CREATE_WITHDRAWAL({
        pocket_id: pocketId,
        amount: req.body.amount,
        user_id: userId
      }).exec().catch((err) => {
        if (err.code === 'P0004') {
          throw new HttpError(400, { 
            message: 'ERR_INSUFFICIENT_FUNDS' 
          });
        }
        if (err.code === 'P0005') {
          throw new HttpError(400, { 
            message: 'ERR_FUNDS_LOCKED' 
          });
        }
        throw err;
      });

      res.sendStatus(200);
    }
  });
};

export default createWithdrawal;