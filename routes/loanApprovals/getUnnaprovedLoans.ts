import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import validateRequest from '../../middleware/validationMiddleware';
import { getByGroupId, GetByGroupIdInterface } from '../../globalTypes';
import { LoanRequest } from '../loanGuarantees/types';

const SQL_GET_UNAPPROVED_LOAN = sql<GetByGroupIdInterface, LoanRequest>(`
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
  WHERE loan_requests.approval_status = 'Pending'
    AND loan_requests.group_id = :group_id
`);

export default (router: Router) => {
  router.get<Record<string, never>, LoanRequest[], GetByGroupIdInterface, Record<string, never>>(
    '/',
    validateRequest({ body: getByGroupId }), // Ensure this matches the expected request body schema
    authMiddleware(),
    async (req, res) => {
      const loans = await SQL_GET_UNAPPROVED_LOAN({
        group_id: req.body.group_id
      }).many();
      return res.json(loans);
    }
  );
};
