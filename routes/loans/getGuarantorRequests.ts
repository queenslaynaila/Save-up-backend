import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import { group } from 'console';
import { entityIdParamsSchema } from '../users/schema';
import { decodeEntityAndVerifyAccess } from '../../utils';


export const loanRequestSchema = z.object({
  group_id: z.number().int(),
  request_id: z.number().int().min(1),
  group_name: z.string(),
  borrower_id: z.number().int().min(1),
  borrower_name: z.string().min(1),
  amount: z.number(),
  purpose: z.string(),
  repayment_period: z.string()
});

export type LoanRequest = z.infer<typeof loanRequestSchema>;
interface GuarantorRequest {
  type_id: number;
  user_id: number;
}

const SQL_GET_UNGUARANTEED_LOAN_REQUESTS = sql<GuarantorRequest, LoanRequest>(`
    SELECT
        debit_requests.xid AS request_id,
        debit_requests.group_id,
        groups.name AS group_name,
        debit_requests.initiator_id,
        initiator_details.full_name AS initiator_name,
        debit_requests.amount,
        debit_requests.reason,
        debit_requests.status,
        debit_requests.created_at,
        loan_details.guarantor_id,
        loan_details.repayment_period,
        guarantor_approvals.approval
    FROM debit_requests
    JOIN groups 
        ON debit_requests.group_id = groups.id
    JOIN user_contact_details AS initiator_details
        ON debit_requests.initiator_id = initiator_details.id
    JOIN loan_details
        ON debit_requests.group_id = loan_details.group_id
        AND debit_requests.xid = loan_details.request_id
    JOIN user_contact_details AS guarantor_details
        ON loan_details.guarantor_id = guarantor_details.id
    LEFT JOIN guarantor_approvals
        ON debit_requests.group_id = guarantor_approvals.group_id
        AND debit_requests.xid = guarantor_approvals.request_id
        AND loan_details.guarantor_id = guarantor_approvals.guarantor_id
    WHERE loan_details.guarantor_id = :user_id
      AND debit_requests.type_id = :type_id;
`);

const getGuarantorRequests = (router: Router) => {
  router.route({
    method: 'get',
    path: '/:group_id/loans/guarantors/:member_id',
    summary: 'Get list of loan requests that require guarantor approval',
    schema: {
        params: z.object({
            group_id: z.number(),
            member_id: entityIdParamsSchema
        })
    },
    response: {
        statusCode:200,
        schema: loanRequestSchema.array()
    },
    auth: true,
    handler: async (req, res) => {
      const entities = await decodeEntityAndVerifyAccess(req,true);
      const {groupId, memberId} = entities
      const loan_requests = await SQL_GET_UNGUARANTEED_LOAN_REQUESTS({
        user_id: req.user!.id,
        type_id: 1
      }).many();
      res.json(loan_requests);
    }
  });
};

export default getGuarantorRequests;