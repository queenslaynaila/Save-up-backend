import Router from '../../router';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { ReviewedLoan, reviewedLoanSchema, ReviewedLoansParams } from './types';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

const SQL_GET_APPLIED_LOANS = sql<ReviewedLoansParams, ReviewedLoan>(`
    SELECT
        debit_requests.xid AS request_id,
        debit_requests.initiator_id,
        borrower_details.full_name AS borrower_name,
        loan_details.guarantor_id,
        guarantor_details.full_name AS guarantor_name,
        debit_requests.group_id,
        groups.name AS group_name,
        debit_requests.pocket_id,
        debit_requests.amount,
        debit_requests.reason,
        debit_requests.status,
        loan_details.repayment_period
    FROM debit_requests
    JOIN groups 
        ON debit_requests.group_id = groups.id
    JOIN user_contact_details AS borrower_details
        ON debit_requests.initiator_id = borrower_details.id
    JOIN loan_details 
        ON debit_requests.group_id = loan_details.group_id
               AND debit_requests.xid = loan_details.request_id
    JOIN user_contact_details AS guarantor_details
        ON loan_details.guarantor_id = guarantor_details.id
    WHERE debit_requests.group_id = :group_id
        AND debit_requests.type_id = :type_id;
`);

const getReviewedLoans = (router: Router) => {
  router.route({
    method: 'get',
    path: '/',
    summary: 'Get list of reviewed loans',
    schema: {
      body: z.object({
        group_id: z.number()
      })
    },
    response: {
      schema: reviewedLoanSchema.array().openapi({ description: 'List of reviewed loans' })
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      const loans = await SQL_GET_APPLIED_LOANS({
        ...req.body,
        user_id: req.user!.id,
        type_id: 1
      }).many();
      return res.json(loans);
    }
  });
};

export default getReviewedLoans;