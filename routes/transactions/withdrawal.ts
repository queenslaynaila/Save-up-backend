import { sql } from '../../db';
import HttpError from '../../httpError';
import Router from '../../router';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { SQL_GET_USER_PIN } from '../users/updateAttributes';

const withdrawalPayload = z.object({
  pocket_id: z.number().min(1),
  amount: z.number().min(50),
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
    request: {
      body: withdrawalPayload.pick({
        pocket_id: true,
        amount: true
      }).extend({
        pin: z.string().regex(/^\d{4}$/)
      })
    },
    response: {
      201: {}
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const { pocket_id, amount, pin } = req.body;
      const { pin: currentPin } = await SQL_GET_USER_PIN({ id: req.user!.id }).one();

      const isValidPin = await bcrypt.compare(pin, currentPin);
      if (!isValidPin) {
        throw new HttpError(403, { message: 'Invalid PIN' });
      }

      await SQL_CREATE_WITHDRAWAL({
        pocket_id,
        amount,
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