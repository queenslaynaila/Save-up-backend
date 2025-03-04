import { sql } from '../../db';
import HttpError from '../../httpError';
import Router from '../../router';
import { z } from 'zod';
import { verifyPin } from '../../middlewares/authorization';
import verifyGroupMembership from '../../middlewares/verifyGrpMembership';

const withdrawalPayload = z.object({
  pocket_id: z.number().min(1),
  amount: z.number().min(50),
  entity_id: z.number()
});

type Withdrawal = z.infer<typeof withdrawalPayload>

const SQL_CREATE_WITHDRAWAL = sql<Withdrawal, Record<string, never>>(`
  SELECT create_withdrawal(:entity_id, :pocket_id, :amount);
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
      }),
      query: z.object({
        group_id: z.string().regex(/^\d+$/).optional()
      })
    },
    response: {
      201: {}
    },
    authMiddlewareOptions: {},
    middlewares: [verifyPin, verifyGroupMembership()],
    handler: async (req, res) => {
      const { pocket_id, amount } = req.body;
      await SQL_CREATE_WITHDRAWAL({
        pocket_id,
        amount,
        entity_id: Number(req.query.group_id) || req.user!.id
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