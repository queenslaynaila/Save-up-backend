import { z } from 'zod';
import Router from '../../new/router';
import { sql } from '../../db';
import { decodeEntityAndVerifyAccess, verifyPin } from '../../utils';
import HttpError from '../../httpError';

const SQL_CREATE_LOAN_GUARANTORS = sql<{
  group_id: number;
  request_id: number;
  user_id:number;
  guarantor_ids: number[];
}, Record<string, never>>(`
  SELECT add_loan_guarantors(
    :group_id,
    :request_id,
    :user_id,
    :guarantor_ids
  )
`);

const addLoanGuarantors = (router: Router) => {
  router.post({
    path: '/groups/:group_id/loans/:xid/guarantors',
    summary: 'Add guarantors for a loan',
    auth: true,
    schema: {
      params: z.object({
        group_id: z.number(),
        xid: z.number()
      }),
      body: z.object({
        guarantor_ids: z.array(z.number()),
        pin: z.string().regex(/^\d{4}$/)
      })
    },
    middlewares: [verifyPin],
    handler: async (req, res) => {
      const groupId = await decodeEntityAndVerifyAccess(req);

      await SQL_CREATE_LOAN_GUARANTORS({
        group_id: groupId,
        request_id: req.params.xid,
        user_id: req.user!.id,
        guarantor_ids: req.body.guarantor_ids
      }).exec().catch((err)=>{
        if (err.code === 'P0001') {
          throw new HttpError(
            400,
            { message: 'ERR_CANT_ADD_SELF' }
          );
        }
        if (err.code === 'P0002') {
          throw new HttpError(
            400,
            { message: 'ERR_INVALID_GUARANTOR' }
          );
        }
        if (err.code === 'P0003') {
          throw new HttpError(
            400,
            { message: 'ERR_GUARANTOR_NO_DEPOSIT' }
          );
        }
        if (err.code === 'P0004') {
          throw new HttpError(
            400,
            { message: 'ERR_NOT_LOAN_INITIATOR' }
          );
        }
        throw err;
      });

      res.sendStatus(201);
    }
  });
};

export default addLoanGuarantors;