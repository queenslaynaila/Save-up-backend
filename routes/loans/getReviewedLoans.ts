import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import validateRequest from '../../middleware/validationMiddleware';
import { ReviewedLoan, ReviewedLoansParams } from './types';
import { GetByGroupIdInterface,  getByGroupId } from '../../globalTypes';

const SQL_GET_REVIEWED_LOANS = sql<ReviewedLoansParams, ReviewedLoan>(`
  SELECT
    loan_requests.xid AS request_id,
    loan_requests.group_id,
    groups.name AS group_name,
    loan_requests.pocket_id,
    loan_requests.amount,
    loan_requests.approval_status
  FROM loan_requests
  JOIN groups ON loan_requests.group_id = groups.id
  WHERE loan_requests.approval_status != :approval_status
    AND loan_requests.group_id = :group_id
    AND loan_requests.borrower_id = :user_id
`);

export default (router: Router) => {
  router.get<Record<string,never>, ReviewedLoan[], GetByGroupIdInterface, Record<string,never>>(
    '/',
    validateRequest({body: getByGroupId}),
    authMiddleware(),
    async (req, res) => {
      const loans = await SQL_GET_REVIEWED_LOANS({
        ...req.body,
        user_id:req.user!.id,
        approval_status: 'Pending'
      }).many()
      return res.json(loans);
    }
  );
};