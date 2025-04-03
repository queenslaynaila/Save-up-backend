import Router from '../../router';
import { sql } from '../../db';
import HttpError from '../../httpError';
import { z } from 'zod';
import { decodeEntityAndVerifyAccess } from '../../utils';

const withdrawalSchema = z.object({
  reason: z.string(),
  recipients: z.array(
    z.object({
      recipient_id: z.number().int().min(1),
      amount: z.number()
    })
  )
})

export type WithdrawalParams = z.infer<typeof withdrawalSchema> & {
  group_id: number;
  initiator_id: number;
  pocket_id: number;
  repayment_period:null
};

const SQL_INITIATE_GRP_WITHDRAWAL = sql<WithdrawalParams, Record<string, never>>(`
  SELECT  create_group_debit_request(
    :group_id, :pocket_id, :initiator_id, :amount, :reason, :repayment_period, :recipients
  )
`);

const createWithdrawalRequest = (router: Router) => {
  router.route({
    method: 'post',
    path: '/:group_id/withdrawal-requests',
    summary: 'Create a group withdrawal request',
    schema: {
      params: z.object({
        group_id: z.number().int().min(1)
      }),
      body: withdrawalSchema.extend({
        pocket_id: z.number()
      })
    },
    auth: true,
    handler: async (req, res) => {
      const groupId = await decodeEntityAndVerifyAccess(req, false, true)
        await SQL_INITIATE_GRP_WITHDRAWAL({
          ...req.body,
          repayment_period:null,
          group_id: groupId,
          initiator_id: req.user!.id
        }).exec().catch (err => {
        if (err.code === 'P0004') {
          throw new HttpError(400, { message: 'ERR_INSUFFICIENT_FUNDS' });
        }
        if (err.code === 'P0005') {
          throw new HttpError(400, { message: 'ERR_FUNDS_LOCKED' });
        }
        throw err;
      });
      res.sendStatus(201);
}});
};

export default createWithdrawalRequest;