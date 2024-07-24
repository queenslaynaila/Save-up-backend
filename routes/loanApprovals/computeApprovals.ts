import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import validateRequest from '../../middleware/validationMiddleware';
import { StatusCodeInterface } from '../../globalTypes';
import { AdminLoanApproval, LoanApproval, loanApprovalSchema } from './types';

const SQL_APPROVE_LOAN = sql<{request_id:number, admin_id:number, group_id:number}, Record<string, never>>(`
  PERFORM approve_loan (:group_id, :request_id, :admin_id, :status, :reason);
`);

export default (router: Router) => {
  router.post<Record<string, never>, StatusCodeInterface, LoanApproval, Record<string, never>>(
    '/',
    validateRequest({ body: loanApprovalSchema }),
    authMiddleware(),
    async (req, res) => {
      await SQL_APPROVE_LOAN({
        ...req.body,
        admin_id: req.user!.id
      }).exec();
      return res.sendStatus(204);
    }
  );
};