import { z } from 'zod';
import Router from '../../core/router';
import { sql } from '../../db';
import { verifyPin } from '../../utils';
import { decodeParamsAndAuthorizeAccess } from '../../decodeParamsAndAuthorizeAccess';

const SQL_INSERT_APPROVAL = sql<{
  group_id: number;
  request_id: number;
  guarantor_id: number;
  approval: boolean;
}, Record<string, never>>(`
  INSERT INTO guarantor_approvals (group_id, request_id, guarantor_id, approval)
  VALUES (:group_id, :request_id, :guarantor_id, :approval)
`);

const SQL_COMPUTE_RESPONSE = sql<{
  group_id: number;
  request_id: number;
}, {
  total_guarantors: number;
  approvals_given: number;
  all_approved: boolean;
}>(`
  SELECT
    COUNT(*) AS total_guarantors,
    COUNT(guarantor_approvals.approval) AS approvals_given,
    BOOL_AND(guarantor_approvals.approval) AS all_approved
  FROM loan_guarantors
  LEFT JOIN guarantor_approvals
    ON loan_guarantors.group_id = guarantor_approvals.group_id
    AND loan_guarantors.request_id = guarantor_approvals.request_id
    AND loan_guarantors.guarantor_id = guarantor_approvals.guarantor_id
  WHERE loan_guarantors.group_id = :group_id
    AND loan_guarantors.request_id = :request_id
`);

const SQL_UPDATE_DEBIT = sql<{
  group_id: number;
  request_id: number;
  status: string;
}, Record<string, never>>(`
    UPDATE debit_requests
    SET status = :status
    WHERE group_id = :group_id 
      AND xid = :request_id
      AND status = 'Pending Guarantor Approval'
`);

const approveGuarantorRequest = (router: Router) => {
  router.post({
    path: '/groups/:group_id/loans/:xid/guarantors/approval',
    summary: 'Approve or deny a loan guarantor request',
    auth: true,
    schema: {
      params: z.object({
        group_id: z.number().int().min(1),
        xid: z.number().int().min(1)
      }),
      body: z.object({
        approval: z.boolean(),
        pin: z.string().regex(/^\d{4}$/)
      })
    },
    middlewares: [verifyPin],
    handler: async (req, res) => {
      const groupId = await decodeParamsAndAuthorizeAccess(req);

      await sql.transaction(async (trx) => {
        await SQL_INSERT_APPROVAL({
          group_id: groupId,
          request_id: req.params.xid,
          guarantor_id: 211,
          approval: req.body.approval
        }).using(trx).exec();

        const { total_guarantors, approvals_given, all_approved } = await SQL_COMPUTE_RESPONSE({
          group_id: groupId,
          request_id: req.params.xid
        }).using(trx).one();

        if (total_guarantors === approvals_given && all_approved) {
          await SQL_UPDATE_DEBIT({
            group_id: groupId,
            request_id: req.params.xid,
            status: 'Pending Admin Approval'
          }).using(trx).exec();
        }
      });

      res.sendStatus(201);
    }
  });
};

export default approveGuarantorRequest;