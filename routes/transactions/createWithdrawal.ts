import { sql } from '../../db';
import HttpError from '../../httpError';
import Router from '../../router';
import { z } from 'zod';
import { decodeEntityAndVerifyAccess, verifyPin } from '../../utils';
import { entityIdParamsSchema } from '../users/schema';

const withdrawalPayload = z.object({
  pocket_id: z.number().int().min(1),
  amount: z.number().min(50),
  user_id: z.number().int().min(1),
  accept_penalty: z.boolean().default(false)
});

type Withdrawal = z.infer<typeof withdrawalPayload>;

const SQL_CREATE_WITHDRAWAL = sql<
  Pick<Withdrawal, 'user_id'|'pocket_id'|'amount'|'accept_penalty'>,
  Record<string, never>
>(`
  SELECT withdraw_from_user_pocket(
    :user_id,
    :pocket_id,
    :amount
    :accept_penalty
  );
`);

const createWithdrawal = (router: Router) => {
  router.post({
    path: '/:user_id/transactions/withdrawals',
    summary: 'Withdraw from a user pocket',
    auth: true,
    schema: {
      params: z.object({
        user_id: entityIdParamsSchema
      }),
      body: withdrawalPayload
        .pick({
          amount: true,
          pocket_id:true,
          accept_penalty:true
        })
        .extend({
          pin: z.string().regex(/^\d{4}$/)
        })
    },
    middlewares: [verifyPin],
    handler: async (req, res) => {
      const userId = await decodeEntityAndVerifyAccess(req);

      await SQL_CREATE_WITHDRAWAL({
        ...req.body,
        user_id: userId,
        accept_penalty: req.body.accept_penalty ?? false
      }).exec().catch(err => {
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