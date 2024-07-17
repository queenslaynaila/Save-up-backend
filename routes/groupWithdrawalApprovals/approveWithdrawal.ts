import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import validateRequest from '../../middleware/validationMiddleware';
import { 
  approveValidation, 
  ApproveWithdrawal, 
  WithdrawalRequest 
} from './types';
import { StatusCodeInterface } from '../../globalTypes/index';

const SQL_APPROVE_GRP_WITHDRAWAL = sql<ApproveWithdrawal, Record<string, never>>(`
    SELECT approve_group_withdrawal(
       :group_id, :admin_id, :withdrawal_id, :status, :reason
    )
`);

export default (router: Router) => {
  router.post<Record<string, never>, StatusCodeInterface, WithdrawalRequest, 
  Record<string, never>>(
    '/', 
    validateRequest({ 
      body:approveValidation
    }),
    authMiddleware(),
    async (req, res) => {
      await SQL_APPROVE_GRP_WITHDRAWAL({
        ...req.body,
        admin_id: req.user!.id,
      }).exec()
      res.sendStatus(201);
    }
  );
};
