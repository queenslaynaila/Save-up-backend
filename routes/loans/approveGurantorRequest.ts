import { z } from 'zod';
import Router from '../../router';
import { sql } from '../../db';
import { decodeEntityAndVerifyAccess, verifyPin } from '../../utils';

const SQL_INSERT_APPROVAL = sql<{
  group_id: number;
  request_id: number;
  guarantor_id: number;
  approval: boolean;
}, Record<string, never>>(`
  INSERT INTO guarantor_approvals (group_id, request_id, guarantor_id, approval)
  VALUES (:group_id, :request_id, :guarantor_id, :approval)
`);

const approveGuarantorRequest = (router: Router) => {
  router.route({
    method: 'post',
    path: '/:group_id/loans/:loan_id/guarantors/approval',
    summary: 'Approve or deny a loan guarantor request',
    auth: true,
    schema: {
      params: z.object({
        group_id: z.number().int().min(1),
        loan_id: z.number().int().min(1)
      }),
      body: z.object({
        approval: z.boolean(),
        pin: z.string().regex(/^\d{4}$/)
      })
    },
    middlewares: [verifyPin],
    handler: async (req, res) => {
      const groupId = await decodeEntityAndVerifyAccess(req);

      await SQL_INSERT_APPROVAL({
        group_id: groupId,
        request_id: req.params.loan_id,
        guarantor_id: req.user!.id,
        approval: req.body.approval
      }).exec();

      res.sendStatus(201);
    }
  });
};

export default approveGuarantorRequest;