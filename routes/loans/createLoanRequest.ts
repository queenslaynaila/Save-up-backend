import { z } from 'zod';
import Router from '../../router';
import { sql } from '../../db';
import { decodeEntityAndVerifyAccess, verifyPin } from '../../utils';
import HttpError from '../../httpError';

const SQL_CREATE_LOAN_REQUEST = sql<{
  group_id: number;
  pocket_id: number;
  initiator_id:number;
  amount:number;
  reason:string;
  repayment_period:string;
}, Record<string, never>>(`
  SELECT create_loan_request(
    :group_id,
    :pocket_id,
    :initiator_id,
    :amount,
    :reason,
    :repayment_period
  )
`);

const requestLoan = (router: Router) => {
  router.route({
    method: 'post',
    path: '/:group_id/loans',
    summary: 'Request a loan',
    auth: true,
    schema: {
      params: z.object({
        group_id: z.number()
      }),
      body:z.object({
        pocket_id: z.number(),
        amount: z.number(),
        reason: z.string(),
        repayment_period: z.string(),
        pin: z.string().regex(/^\d{4}$/)
      })
    },
    middlewares:[verifyPin],
    handler: async (req, res) => {
      const groupId = await decodeEntityAndVerifyAccess(req)
      await SQL_CREATE_LOAN_REQUEST({
        ...req.body,
        group_id: groupId,
        initiator_id: req.user!.id
      }).exec().catch(err=>{
        if(err.code === 'P0005') {
         throw new HttpError(400, {message:'ERR_FUNDS_LOCKED'})
        };
        if(err.code === 'P0004') {
          throw new HttpError(400, {message:'ERR_INSUFFICIENT_FUNDS'})
        };
        if(err.code === 'P0006') {
          throw new HttpError(400, {message:'ERR_NO_DEPOSIT_MADE'})
        };
        throw err;
      });
      res.sendStatus(201);
    }
  });
};

export default requestLoan;