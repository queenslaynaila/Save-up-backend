import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import { decodeEntityAndVerifyAccess } from '../../utils';

const Approval = z.object({
  user_id: z.number().int().min(1),
  full_name: z.string(),
  status: z.string(),
  reason: z.string()
});

const Recipient = z.object({
  recipient_id: z.number().int().min(1),
  recipient_name: z.string()
});

const withdrawalRequestSchema = z.object({
  xid: z.number().int().min(1),
  requested_by: z.string(),
  amount: z.number(),
  reason: z.string(),
  requested_at: z.string(),
  status: z.string(),
  reviews: z.array(Approval).nullable(),
  recipients: z.array(Recipient).min(1)
});

 
export type WithdrawalRequest = z.infer<typeof withdrawalRequestSchema>;

const SQL_GET_GROUP_WITHDRAWALS = sql<
  {
    group_id: number;
    user_id: number;
    pocket_id: number;
  },
  WithdrawalRequest
>(`
SELECT  
    debit_requests.xid,  
    user_contact_details.full_name AS requested_by,
    debit_requests.amount, 
    debit_requests.reason,
    debit_requests.status,
    debit_requests.created_at AS requested_at,
    debit_types.type AS request_type,
    
    (
      SELECT json_agg(json_build_object(
        'user_id', debit_approvals.admin_id,
        'full_name', admin_contact_details.full_name,
        'status', debit_approvals.status,
        'reason', debit_approvals.reason
      ))
      FROM debit_approvals
      JOIN user_contact_details AS admin_contact_details 
        ON debit_approvals.admin_id = admin_contact_details.id
      WHERE debit_approvals.group_id = debit_requests.group_id
        AND debit_approvals.request_id = debit_requests.xid
    ) AS reviews,

    CASE 
      WHEN debit_types.type = 'Withdrawal' THEN (
        SELECT json_agg(json_build_object(
          'user_id', withdrawal_debit_recipients.user_id,
          'full_name', recipient_contact_details.full_name,
          'amount', withdrawal_debit_recipients.amount
        ))
        FROM withdrawal_debit_recipients
        JOIN user_contact_details AS recipient_contact_details 
          ON withdrawal_debit_recipients.user_id = recipient_contact_details.id
        WHERE withdrawal_debit_recipients.group_id = debit_requests.group_id 
          AND withdrawal_debit_recipients.request_id = debit_requests.xid
      )
      ELSE '[]'::json
    END AS recipients,

    CASE 
      WHEN debit_types.type = 'Loan' THEN (
        SELECT json_agg(json_build_object(
          'user_id', loan_debit_guarantors.guarantor_id,
          'full_name', guarantor_contact_details.full_name,
          'approval', COALESCE(guarantor_approvals.approval, 'Pending')
        ))
        FROM loan_debit_guarantors
        JOIN user_contact_details AS guarantor_contact_details 
          ON loan_debit_guarantors.guarantor_id = guarantor_contact_details.id
        LEFT JOIN guarantor_approvals 
          ON loan_debit_guarantors.group_id = guarantor_approvals.group_id
          AND loan_debit_guarantors.request_id = guarantor_approvals.request_id
          AND loan_debit_guarantors.guarantor_id = guarantor_approvals.guarantor_id
        WHERE loan_debit_guarantors.group_id = debit_requests.group_id 
          AND loan_debit_guarantors.request_id = debit_requests.xid
      )
      ELSE '[]'::json
    END AS guarantors

FROM debit_requests
JOIN user_contact_details 
  ON debit_requests.initiator_id = user_contact_details.id
JOIN debit_types 
  ON debit_requests.type_id = debit_types.id

WHERE debit_requests.group_id = :group_id
  AND debit_requests.pocket_id = :pocket_id
  AND debit_types.type IN ('Loan', 'Withdrawal')
ORDER BY debit_requests.created_at DESC;
`);

const getGrpDebitRequests = (router: Router) => {
  router.route({
    method: 'get',
    path: '/:group_id/:pocket_id',
    summary: 'Get withdrawal requests for a group pocket',
    schema: {
      params: z.object({
        group_id: z.number().int().min(1),
        pocket_id: z.number().int().min(1)
      })
    },
    response: {
        statusCode: 200,
        schema: z.array(withdrawalRequestSchema)
    },
    auth: true,
    handler: async (req, res) => {
      const groupId = await decodeEntityAndVerifyAccess(req,true)
      const withdrawals = await SQL_GET_GROUP_WITHDRAWALS({
        group_id: groupId,
        pocket_id: req.params.pocket_id,
        user_id: req.user!.id
      }).many();

      res.json(withdrawals);
    }
  });
};

export default getGrpDebitRequests;