import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { LoanRequest } from './types';
import { GetByUserInterface } from '../../globalTypes';

const SQL_GET_UNGUARANTEED_LOAN_REQUESTS = sql<GetByUserInterface, LoanRequest>(`
    SELECT
        debit_requests.xid AS request_id,
        debit_requests.group_id,
        groups.name AS group_name,
        user_contact_details.full_name AS borrower_name,
        debit_requests.amount,
        debit_requests.reason,
        loan_details.repayment_period
    FROM  debit_requests
    JOIN  groups 
        ON debit_requests.group_id = groups.id
    JOIN  user_contact_details 
        ON debit_requests.requestor_id = user_contact_details.id
    JOIN  loan_details 
        ON debit_requests.group_id = loan_details.group_id 
               AND debit_requests.xid = loan_details.request_id
    LEFT JOIN guarantor_approvals 
        ON debit_requests.group_id = guarantor_approvals.group_id 
               AND debit_requests.xid = guarantor_approvals.request_id 
               AND guarantor_approvals.guarantor_id = :user_id
    WHERE loan_details.guarantor_id = :user_id
        AND guarantor_approvals.approval IS NULL;
`);

export default (router: Router) => {
  router.get<Record<string, never>, LoanRequest[], Record<string, never>,
  Record<string, never>>(
    '/',
    authMiddleware(),
    async (req, res) => {
      const loan_requests = await SQL_GET_UNGUARANTEED_LOAN_REQUESTS({
        user_id: req.user!.id
      }).many();
      res.json(loan_requests);
    }
  );
};