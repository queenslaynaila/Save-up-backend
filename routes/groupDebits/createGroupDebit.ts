import Router from '../../router';
import { sql } from '../../db';
import HttpError from '../../httpError';
import { z } from 'zod';
import verifyGroupMembership from '../../utils';
import logger from '../../logger';

const baseDebitSchema = z.object({
  reason: z.string().min(1)
});

const loanSchema = z.object({
  type: z.literal('Loan'),
  repayment_period: z.string(),
  guarantors: z.array(z.number().int()).min(1),
  amount:z.number().gt(50)
}).merge(baseDebitSchema);

const withdrawalSchema = z.object({
  type: z.literal('Withdrawal'),
  recipients: z.array(
    z.object({
      recipient_id: z.number().int().gt(0),
      amount: z.number().gt(50)
    })
  ).min(1)
}).merge(baseDebitSchema);

export const debitRequestSchema = z.discriminatedUnion('type', [
  loanSchema,
  withdrawalSchema
]) 

export type DebitRequest = z.infer<typeof debitRequestSchema> & {
  group_id: number;
  initiator_id: number;
  pocket_id: number;
};

const SQL_CREATE_GROUP_DEBIT = sql<DebitRequest, Record<string, never>>(`
  SELECT create_group_debit(
    :group_id, 
    :initiator_id, 
    :pocket_id, 
    :amount, 
    :reason, 
    :type, 
    :repayment_period, 
    :recipients, 
    :guarantors
  )
`);

const createDebitRequest = (router: Router) => {
  router.route({
    method: 'post',
    path: '/:group_id/:pocket_id',
    summary: 'Create a group debit request for Loan or Withdrawal',
    response: {
      201: {}
    },
    request: {
      params: z.object({
        group_id: z.string().regex(/^[1-9]\d*$/),
        pocket_id: z.string().regex(/^[1-9]\d*$/)
      }),
      body: debitRequestSchema
    },
    authMiddlewareOptions: {},
    middlewares: [
      verifyGroupMembership()
    ],
    handler: async (req, res) => {
      logger.info('Creating group debit request');
      const groupId = parseInt(req.params.group_id, 10);
      const pocketId = parseInt(req.params.pocket_id, 10);
        await SQL_CREATE_GROUP_DEBIT({
          ...req.body,
          group_id: groupId,
          pocket_id: pocketId,
          initiator_id: req.user!.id
        }).exec().catch (err => {

          logger.info('Error creating group debit request');
        if (err.code === 'P0001') {
          throw new HttpError(403, { message: 'ERR_NOT_GROUP_ADMIN' });
        }
        if (err.code === 'P0002') {
          throw new HttpError(400, { message: 'ERR_NO_REPAYMENT_PERIOD' });
        }
        if (err.code === 'P0004') {
          throw new HttpError(400, { message: 'ERR_INSUFFICIENT_FUNDS' });
        }
        throw err;
      });
      res.sendStatus(201);
}});
};

export default createDebitRequest;

// {
//   "group_id": 1,
//   "pocket_id": 1,
//   "amount": 0,
//   "reason": "string",
//   "recipients": [
//     {
//       "recipient_id": 0,
//       "amount": 0
//     }
//   ]
// }