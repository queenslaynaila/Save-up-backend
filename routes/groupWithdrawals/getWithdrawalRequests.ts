import Router from '../../core/router';
import { sql } from '../../db';
import { z } from 'zod';
import { decodeEntityAndVerifyAccess } from '../../utils';

export const DebitType = z.enum(['Loan', 'Withdrawal']);

const withdrawalRequestSchema = z.object({
  xid: z.number().int().min(1),
  initiator_id: z.number().int().min(1),
  initiator_name: z.string(),
  pocket_id: z.number().int().min(1),
  pocket_name: z.string(),
  reason: z.string(),
  total_amount: z.number(),
  status: z.string(),
  admin_reviews: z
    .array(
      z.object({
        admin_id: z.number().int().min(1),
        admin_name: z.string(),
        status: z.enum(['Approved', 'Rejected', 'Cancelled']),
        reason: z.string(),
        approval_date: z.string()
      })
    )
    .nullable(),
  recipients: z
    .array(
      z.object({
        recipient_id: z.number().int().min(1),
        recipient_name: z.string(),
        amount: z.number()
      })
    )
    .min(1),
  created_at: z.string()
});

type WithdrawalRequest = z.infer<typeof withdrawalRequestSchema>;

const SQL_GET_GROUP_WITHDRAWALS = sql<
{
  group_id: number;
  pocket_id?: number;
  debit_type: string;
},
WithdrawalRequest
>(`
  SELECT 
    debit_requests.xid,
    debit_requests.initiator_id,
    initiator_user_contact_details.full_name AS initiator_name,
    pockets.xid AS pocket_id,
    pockets.name AS pocket_name,
    debit_requests.reason,
    debit_requests.amount AS total_amount,
    debit_requests.status,
    debit_requests.created_at,

    COALESCE(
        (SELECT json_agg(
            json_build_object(
                'admin_id', debit_approvals.admin_id,
                'admin_name', admin_user_contact_details.full_name,
                'status', debit_approvals.status,
                'reason', debit_approvals.reason,
                'approval_date', debit_approvals.created_at
            ) ORDER BY debit_approvals.created_at
        )
        FROM debit_approvals
        JOIN user_contact_details AS admin_user_contact_details 
          ON admin_user_contact_details.id = debit_approvals.admin_id
        WHERE debit_approvals.group_id = debit_requests.group_id 
          AND debit_approvals.request_id = debit_requests.xid),
        '[]'::json
    ) AS admin_reviews,
     
    (SELECT json_agg(
        json_build_object(
            'recipient_id', withdrawal_recipients.recipient_id,
            'recipient_name', recipient_user_contact_details.full_name,
            'amount', withdrawal_recipients.amount
        ) ORDER BY withdrawal_recipients.recipient_id
    )
    FROM withdrawal_recipients
    JOIN user_contact_details AS recipient_user_contact_details 
        ON recipient_user_contact_details.id = withdrawal_recipients.recipient_id
    WHERE withdrawal_recipients.group_id = debit_requests.group_id 
      AND withdrawal_recipients.request_id = debit_requests.xid
    ) AS recipients
  FROM 
    debit_requests
  JOIN user_contact_details AS initiator_user_contact_details 
    ON initiator_user_contact_details.id = debit_requests.initiator_id
  LEFT JOIN pockets
    ON pockets.entity_id = debit_requests.group_id
    AND pockets.xid = debit_requests.pocket_id
  WHERE 
    debit_requests.group_id = :group_id
    AND (:pocket_id::INT IS NULL OR debit_requests.pocket_id = :pocket_id)
    AND debit_requests.debit_type = :debit_type
  ORDER BY 
    debit_requests.created_at DESC;
`);

const getGrpDebitRequests = (router: Router) => {
  router.get({
    path: '/groups/:group_id/withdrawal-requests',
    summary: 'Get all withdrawal requests made for a group',
    schema: {
      params: z.object({
        group_id: z.number().int().min(1)
      }),
      query: z.object({
        pocket_id: z.number().int().min(1)
      }).partial()
    },
    response: {
      statusCode: 200,
      schema: z.array(withdrawalRequestSchema)
    },
    auth: true,
    handler: async (req, res) => {
      const groupId = await decodeEntityAndVerifyAccess(req, true);
      const withdrawals = await SQL_GET_GROUP_WITHDRAWALS({
        group_id: groupId,
        pocket_id: req.query.pocket_id,
        debit_type: DebitType.enum.Withdrawal
      }).many();

      res.json(withdrawals);
    }
  });
};

export default getGrpDebitRequests;
