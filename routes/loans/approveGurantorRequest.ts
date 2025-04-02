import { z } from 'zod';
import Router from '../../router';
import { sql } from '../../db';
import { decodeEntityAndVerifyAccess, verifyPin } from '../../utils';

const SQL_APPROVE_LOAN_GUARANTORS = sql<{
  group_id: number;
  request_id:number;
  initiator_id: number; 
  approval: boolean
}, Record<string, never>>(`
  SELECT approve_loan_guarantor(
    :group_id,
    :request_id,
    :initiator_id,
    :approval
  )
`);

const approveGuarantorRequest = (router: Router) => {
  router.route({
    method: 'post',
    path: '/:group_id/loans/:loan_id/guarantors/approve',
    summary: 'Approve or deny a loan guarantor request',
    auth: true,
    schema: {
      params: z.object({
        group_id: z.number(),
        loan_id: z.number()
      }),
      body: z.object({
        approval: z.boolean(), 
        pin: z.number()
      })
    },
    middlewares: [verifyPin],
    handler: async (req, res) => {
      const groupId = await decodeEntityAndVerifyAccess(req); 

      await SQL_APPROVE_LOAN_GUARANTORS({
        group_id: groupId,
        request_id: req.params.loan_id,
        initiator_id: req.user!.id,
        approval: req.body.approval
      }).exec();

      res.sendStatus(201);
    }
  });
};

export default approveGuarantorRequest;
