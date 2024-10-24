import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import validateRequest from '../../middleware/validationMiddleware';
import { StatusCodeInterface } from '../../globalTypes';
import { FinalnApproval, finalApprovalBody, FinalApprovalBody } from './types';

const SQL_COMPUTE_APPROVALS = sql< FinalnApproval, Record<string, never>>(`
  SELECT compute_loan_approvals(:group_id, :request_id, :admin_id );
`);

export default (router: Router) => {
  router.post<Record<string, never>, StatusCodeInterface, FinalApprovalBody, Record<string, never>>(
    '/',
    validateRequest({ body: finalApprovalBody }),
    authMiddleware(),
    async (req, res) => {
      await SQL_COMPUTE_APPROVALS({
        ...req.body,
        admin_id: req.user!.id
      }).exec();
      return res.sendStatus(204);
    }
  );
};