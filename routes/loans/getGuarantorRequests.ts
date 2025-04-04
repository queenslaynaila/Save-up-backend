import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import { entityIdParamsSchema } from '../users/schema';
import { decodeEntityAndVerifyAccess } from '../../utils';

const SQL_GET_GUARANTOR_REQUESTS = sql<{
  group_id: number;
  user_id: number;
},
{
  xid: number;
  borrower_id: number;
  borrower_name: string;
  amount: number;
  reason: string;
  repayment_period: string;
  other_guarantors: Array<{
    id: number;
    name: string;
    approval: boolean | null;
  }>;
}>(`
  SELECT 
    debit_requests.xid,
    debit_requests.initiator_id AS borrower_id,
    borrower_details.full_name AS borrower_name,
    debit_requests.amount,
    debit_requests.reason,
    loan_requests.repayment_period::text AS repayment_period,
    ARRAY(
      SELECT 
        JSON_BUILD_OBJECT(
          'id', loan_guarantors.guarantor_id,
          'name', user_contact_details.full_name,
          'approval', guarantor_approvals.approval
        )
      FROM loan_guarantors
      LEFT JOIN guarantor_approvals
        ON loan_guarantors.group_id = guarantor_approvals.group_id
        AND loan_guarantors.request_id = guarantor_approvals.request_id
        AND loan_guarantors.guarantor_id = guarantor_approvals.guarantor_id
      JOIN user_contact_details 
        ON loan_guarantors.guarantor_id = user_contact_details.id
      WHERE loan_guarantors.group_id = debit_requests.group_id
        AND loan_guarantors.request_id = debit_requests.xid
        AND loan_guarantors.guarantor_id != :user_id
    ) AS other_guarantors
  FROM debit_requests
  JOIN loan_requests 
    ON debit_requests.group_id = loan_requests.group_id 
    AND debit_requests.xid = loan_requests.request_id
  JOIN user_contact_details AS borrower_details
    ON debit_requests.initiator_id = borrower_details.id
  JOIN loan_guarantors AS current_guarantor
    ON debit_requests.group_id = current_guarantor.group_id
    AND debit_requests.xid = current_guarantor.request_id
  WHERE current_guarantor.group_id = :group_id
    AND current_guarantor.guarantor_id = :user_id;
`);


const getGuarantorRequests = (router: Router) => {
  router.route({
    method: 'get',
    path: '/:group_id/loans/guarantor-requests/:member_id',
    summary: 'Get all guarantor requests made to a grp member',
    schema: {
      params: z.object({
        group_id: z.number(),
        member_id: entityIdParamsSchema
      })
    },
    response: {
      statusCode: 200,
      schema: z.array(z.object({
        xid: z.number(),
        borrower_id: z.number(),
        borrower_name: z.string(),
        amount: z.number(),
        reason: z.string(),
        repayment_period: z.string(),
        other_guarantors: z.array(z.object({
          id: z.number(),
          name: z.string(),
          approval: z.boolean().nullable()
        }))
      }))
    },
    auth: true,
    handler: async (req, res) => {
      const entities = await decodeEntityAndVerifyAccess(req, true);
      const { groupId, memberId } = entities;

      const loanRequests = await SQL_GET_GUARANTOR_REQUESTS ({
        group_id: groupId,
        user_id: memberId,
      }).many();

      res.json(loanRequests);
    }
  });
};

export default getGuarantorRequests;