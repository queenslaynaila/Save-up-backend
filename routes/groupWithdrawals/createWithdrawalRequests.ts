import Router from '../../router';
import { sql } from '../../db';
import HttpError from '../../httpError';
import { z } from 'zod';
import logger from '../../logger';
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
};

const SQL_INITIATE_GRP_WITHDRAWAL = sql<WithdrawalParams, Record<string, never>>(`
  SELECT initiate_grp_withdrawal(
    :group_id, :pocket_id, :initiator_id, :amount, :reason, :recipients
  )
`);

const createWithdrawalRequest = (router: Router) => {
  router.route({
    method: 'post',
    path: '/:group_id/:pocket_id',
    summary: 'Create a group debit request for Withdrawal',
    schema: {
      params: z.object({
        group_id: z.number().int().min(1),
        pocket_id: z.number().int().min(1)
      }),
      body: withdrawalSchema
    },
    auth: true,
    handler: async (req, res) => {
      const groupId = await decodeEntityAndVerifyAccess(req, false, true)
        await SQL_INITIATE_GRP_WITHDRAWAL({
          ...req.body,
          group_id: groupId,
          pocket_id: req.params.pocket_id,
          initiator_id: req.user!.id
        }).exec().catch (err => {
        if (err.code === 'P0001') {
          throw new HttpError(403, { message: 'ERR_NOT_GROUP_ADMIN' });
        }
        if (err.code === 'P0002') {
          throw new HttpError(400, { message: 'ERR_NO_REPAYMENT_PERIOD' });
        }
        if (err.code === 'P0004') {
          throw new HttpError(400, { message: 'ERR_INSUFFICIENT_FUNDS' });
        }
        logger.info(`Error creating group debit schema: ${err}`);
        throw err;
      });
      res.sendStatus(201);
}});
};

export default createWithdrawalRequest;