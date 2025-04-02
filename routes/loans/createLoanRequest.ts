import { z } from 'zod';
import Router from '../../router';
import { sql } from '../../db';
import { decodeEntityAndVerifyAccess, verifyPin } from '../../utils';

const SQL_CREATE_LOAN_REQUEST = sql<{
  reason: string;
  repayment_period: string;
  amount: number;
  group_id: number;
  pocket_id: number;
  initiator_id: number;
}, Record<string, never>>(`
  SELECT create_loan_request(
    :group_id,
    :initiator_id,
    :pocket_id,
    :amount,
    :reason,
    :repayment_period,
    :guarantors
  )
`);

const requestLoan = (router: Router) => {
  router.route({
    method: 'post',
    path: '/:group_id/loans/',
    summary: 'Request a loan',
    auth: true,
    schema: {
      params: z.object({
        group_id: z.number()
      }),
      body:z.object({
        pocket_id: z.number(),
        reason: z.string(),
        repayment_period: z.string(),
        amount: z.number(),
        pin: z.number()
      })
    },
    middlewares:[verifyPin],
    handler: async (req, res) => {
      const groupId = await decodeEntityAndVerifyAccess(req)
      await SQL_CREATE_LOAN_REQUEST({
        ...req.body,
        group_id: groupId,
        initiator_id: req.user!.id
      }).exec();
      res.sendStatus(201);
    }
  });
};

export default requestLoan;