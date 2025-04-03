import { z } from 'zod';
import Router from '../../router';
import { sql } from '../../db';
import { decodeEntityAndVerifyAccess } from '../../utils';
import { DebitType } from '../groupWithdrawals/getWithdrawalRequests';

const loanRequestSchema = z.object({
  xid: z.number().int().min(1),
  initiator_id: z.number().int().min(1),
  initiator_name: z.string(),
  amount: z.number(),
  reason: z.string(),
  repayment_period: z.string(),
  guarantors: z.array(
    z.object({
      guarantor_id: z.number().int().min(1),
      guarantor_name: z.string(),
      approval:z.boolean().nullable(),
    })
  ),
  admin_approvals: z.array(
    z.object({
      admin_id: z.number().int().min(1),
      admin_name: z.string(),
      status: z.enum(['Approved', 'Rejected']),
      reason: z.string(),
      approval_date: z.string().datetime(),
    })
  ),
  status: z.enum(['Approved', 'Rejected', 'Pending Guarantors', 'Pending Admin Approval', 'Cancelled']),
  created_at: z.string().datetime(),
});

export type LoanRequest = z.infer<typeof loanRequestSchema>;

const SQL_GET_LOANS = sql<{
  group_id: number,
  pocket_id: number,
  debit_type:string
 }, LoanRequest>(`
  SELECT 
    debit_requests.xid,
    debit_requests.initiator_id,
    initiator_user_contact_details.full_name AS initiator_name,
    debit_requests.amount,
    debit_requests.reason,
    loan_requests.repayment_period::text AS repayment_period,
    debit_requests.status,
    debit_requests.created_at,
    
    COALESCE(
      (SELECT json_agg(
        json_build_object(
          'guarantor_id', loan_guarantors.guarantor_id,
          'guarantor_name', guarantor_user_contact_details.full_name,
          'approval', guarantor_approvals.approval
        ))
      FROM loan_guarantors
      JOIN user_contact_details AS guarantor_user_contact_details 
        ON guarantor_user_contact_details.id = loan_guarantors.guarantor_id
      LEFT JOIN guarantor_approvals 
        ON guarantor_approvals.group_id = loan_guarantors.group_id 
        AND guarantor_approvals.request_id = loan_guarantors.request_id
        AND guarantor_approvals.guarantor_id = loan_guarantors.guarantor_id
      WHERE loan_guarantors.group_id = debit_requests.group_id 
        AND loan_guarantors.request_id = debit_requests.xid),
      '[]'::json
    ) AS guarantors,
    
    COALESCE(
      (SELECT json_agg(
        json_build_object(
          'admin_id', debit_approvals.admin_id,
          'admin_name', admin_user_contact_details.full_name,
          'status', debit_approvals.status,
          'reason', debit_approvals.reason,
          'approval_date', debit_approvals.created_at
        ) ORDER BY debit_approvals.created_at)
      FROM debit_approvals
      JOIN user_contact_details AS admin_user_contact_details 
        ON admin_user_contact_details.id = debit_approvals.admin_id
      WHERE debit_approvals.group_id = debit_requests.group_id 
        AND debit_approvals.request_id = debit_requests.xid),
      '[]'::json
    ) AS admin_approvals
  FROM 
    debit_requests
  JOIN 
    user_contact_details AS initiator_user_contact_details 
    ON initiator_user_contact_details.id = debit_requests.initiator_id
  JOIN
    loan_requests
    ON loan_requests.group_id = debit_requests.group_id 
    AND loan_requests.request_id = debit_requests.xid
  WHERE 
    debit_requests.group_id = :group_id  
    AND debit_requests.pocket_id = :pocket_id   
    AND debit_requests.debit_type = :debit_type
  ORDER BY 
    debit_requests.created_at DESC;
`);

const getLoanRequests = (router: Router) => {
  router.route({
    method: 'get',
    path: '/:group_id/loans',
    auth: true,
    summary: 'Get loans request made to a group',
    schema: {
      params: z.object({
        group_id: z.number().int().min(1),
      }),
      query: z.object({
        pocket_id: z.number().int().min(1),
      }),
    },
    response: {
      statusCode: 200,
      schema: z.array(loanRequestSchema),
    },
    handler: async (req, res) => {
      const groupId = await decodeEntityAndVerifyAccess(req, true);
      const loans = await SQL_GET_LOANS({
        group_id: groupId,
        pocket_id: req.query.pocket_id,
        debit_type:DebitType.Enum.Loan
      }).many();
      res.json(loans);
    },
  });
};

export default getLoanRequests;
