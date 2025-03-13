import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import verifyGroupMembership from '../../utils';

const Approval = z.object({
  user_id: z.string(),
  full_name: z.string(),
  status: z.string(),
  reason: z.string()
});

const WithdrawalRequest = z.object({
  xid: z.number(),
  requested_by_id: z.number(),
  requested_by: z.string(),
  recipient_id: z.number(),
  recipient_name: z.string(),
  amount: z.number(),
  reason: z.string(),
  requested_at: z.string(),
  status: z.string(),
  reviews: z.array(Approval).nullable()
});

type WithdrawalRequestType = z.infer<typeof WithdrawalRequest>;

const SQL_GET_GROUP_WITHDRAWALS = sql<
  {
    group_id: number;
    user_id: number;
    pocket_id: number;
  },
  WithdrawalRequestType
>(`
  SELECT  
    debit_requests.xid,  
    initiator_contact_details.full_name AS requested_by,
    debit_requests.amount, 
    debit_requests.reason,
    debit_requests.status,
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
    recipient_contact_details.full_name AS recipient_name,
    debit_requests.created_at AS requested_at
  FROM debit_requests
  JOIN user_contact_details AS initiator_contact_details 
    ON debit_requests.initiator_id = initiator_contact_details.id
  JOIN debit_recipients 
    ON debit_requests.group_id = debit_recipients.group_id 
    AND debit_requests.xid = debit_recipients.request_id
  JOIN user_contact_details AS recipient_contact_details 
    ON debit_recipients.recipient_id = recipient_contact_details.id
  WHERE debit_requests.group_id = :group_id
    AND debit_requests.pocket_id = :pocket_id
    AND debit_requests.type_id = (
      SELECT id 
      FROM debit_request_types 
      WHERE name = 'Withdrawal'
    )
  ORDER BY debit_requests.created_at DESC
`);

const getGroupWithdrawals = (router: Router) => {
  router.route({
    method: 'get',
    path: '/',
    summary: 'Get all withdrawal requests made to a group pocket',
    description: 'Retrieves a list of all withdrawal requests with their approval status.',
    request: {
      query: z.object({
        group_id: z.string()
          .regex(/^[1-9]\d*$/, 'Must be a positive integer'),
        pocket_id: z.string()
          .regex(/^[1-9]\d*$/, 'Must be a positive integer')
      })
    },
    response: {
      200: {
        schema: z.array(WithdrawalRequest)
      }
    },
    authMiddlewareOptions: {},
    middlewares: [
      verifyGroupMembership({ allowModeratorAccess: true })
    ],
    handler: async (req, res) => {
      const withdrawals = await SQL_GET_GROUP_WITHDRAWALS({
        group_id: Number(req.query.group_id),
        pocket_id: Number(req.query.pocket_id),
        user_id: req.user!.id
      }).many();

      res.json(withdrawals);
    }
  });
};

export default getGroupWithdrawals;