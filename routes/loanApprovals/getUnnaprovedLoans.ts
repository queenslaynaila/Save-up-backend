import Router from '../../router';
import { sql } from '../../db';
import authMiddleware from '../../authorization';
import { GetByGroupIdInterface } from '../../types';
import { LoanRequest, loanRequestSchema } from '../loanGuarantees/types';
import { z } from 'zod';

interface ExtendedGetByGroupIdInterface extends GetByGroupIdInterface {
  approval_status:'Pending';
}

const SQL_GET_UNAPPROVED_LOAN = sql<ExtendedGetByGroupIdInterface, LoanRequest>(`
  SELECT 
    loan_requests.group_id,
    groups.name AS group_name,
    loan_requests.xid AS request_id,
    loan_requests.borrower_id,
    user_contact_details.full_name AS borrower_name,
    loan_requests.amount,
    loan_requests.purpose,
    loan_requests.repayment_period
  FROM loan_requests
  JOIN user_contact_details
    ON loan_requests.borrower_id = user_contact_details.id
  JOIN groups
    ON loan_requests.group_id = groups.id
  LEFT JOIN loan_admin_approvals
    ON loan_requests.group_id = loan_admin_approvals.group_id
    AND loan_requests.xid = loan_admin_approvals.request_id
    AND loan_admin_approvals.admin_id = :admin_id
  WHERE loan_requests.group_id = :group_id
    AND loan_requests.approval_status = :approval_status
    AND loan_admin_approvals.admin_id IS NULL
`);

const getUnapprovedLoans = (router: Router) => {
  router.route({
    method: 'get',
    path: '/',
    summary: 'Get list of unapproved loans',
    schema: {
      body: z.object({
        group_id: z.number()
      })
    },
    response: {
      schema: loanRequestSchema.array()
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      const loans = await SQL_GET_UNAPPROVED_LOAN({
        group_id: req.body.group_id,
        approval_status: 'Pending'
      }).many();
      res.json(loans);
    }
  });
};

export default getUnapprovedLoans;
