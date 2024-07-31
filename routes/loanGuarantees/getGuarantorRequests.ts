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
      AND debit_requests.type_id = 1;
`);

export default (router: Router) => {
  router.get<Record<string, never>, LoanRequest[], Record<string, never>,
  Record<string, never>>(
    '/:guarantor_id/requests',
    authMiddleware(),
    async (req, res) => {
      const loan_requests = await SQL_GET_UNGUARANTEED_LOAN_REQUESTS({
        user_id: req.user!.id
      }).many();
      res.json(loan_requests);
    }
  );
};