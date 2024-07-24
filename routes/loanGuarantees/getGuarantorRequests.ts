import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { LoanRequest } from './types';
import { GetByUserInterface } from '../../globalTypes';

const SQL_GET_UNGARANTEED_LOAN_REQUESTS = sql<GetByUserInterface, LoanRequest>(`
    SELECT
        loan_requests.xid AS request_id,
        loan_requests.group_id,
        groups.name AS group_name,
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
    LEFT JOIN loan_guarantor_approvals
        ON loan_requests.group_id = loan_guarantor_approvals.group_id
        AND loan_requests.xid = loan_guarantor_approvals.request_id
    WHERE loan_requests.guarantor_id = :user_id
    AND loan_guarantor_approvals.request_id IS NULL;
`);

export default (router: Router) => {
  router.get<Record<string, never>, LoanRequest[], Record<string, never>, 
  Record<string, never>>(
    '/',
    authMiddleware(),
    async (req, res) => {
      const loan_requests = await SQL_GET_UNGARANTEED_LOAN_REQUESTS({
        user_id: req.user!.id
      }).many();
      res.json(loan_requests);
    }
  );
};