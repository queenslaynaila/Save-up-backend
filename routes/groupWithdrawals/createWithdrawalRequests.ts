import Router from '../../core/router';
import { sql } from '../../db';
import HttpError from '../../httpError';
import { z } from 'zod';
import { decodeEntityAndVerifyAccess, verifyPin } from '../../utils';

type WithdrawalParams = {
  group_id: number;
  initiator_id: number;
  pocket_id: number;
  reason: string;
  recipients: {
    recipient_id: number;
    amount: number;
  }[];
}

const SQL_INITIATE_GRP_WITHDRAWAL = sql<WithdrawalParams, Record<string, never>>(`
  SELECT create_withdrawal_request(
    :group_id, :pocket_id, :initiator_id, :reason, :recipients
  )
`);

const createWithdrawalRequest = (router: Router) => {
  router.post({
    path: '/groups/:group_id/withdrawal-requests',
    summary: 'Create a group withdrawal request',
    schema: {
      params: z.object({
        group_id: z.number().int().min(1)
      }),
      body: z.object({
        pocket_id: z.number(),
        reason: z.string(),
        pin: z.string().regex(/^\d{4}$/),
        recipients: z.array(
          z.object({
            recipient_id: z.number().int().min(1),
            amount: z.number()
          })
        ) })
    },
    auth: true,
    middlewares: [verifyPin],
    handler: async (req, res) => {
      const groupId = await decodeEntityAndVerifyAccess(req, false, true);
      await SQL_INITIATE_GRP_WITHDRAWAL({
        ...req.body,
        group_id: groupId,
        initiator_id: req.user!.id
      }).exec().catch(err => {
        if (err.code === 'P0004') {
          throw new HttpError(400, { message: 'ERR_INSUFFICIENT_FUNDS' });
        }
        if (err.code === 'P0005') {
          throw new HttpError(400, { message: 'ERR_FUNDS_LOCKED' });
        }
        throw err;
      });
      res.sendStatus(201);
    } });
};

export default createWithdrawalRequest;