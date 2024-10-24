import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import validateRequest from '../../middleware/validationMiddleware';
import {
  WithdrawalRequest,
  WithdrawalValidation,
  withdrawalValidation
} from './types';
import { StatusCodeInterface } from '../../globalTypes';

const SQL_INITIATE_GRP_WITHDRAWAL = sql<WithdrawalRequest, Record<string, never>>(`
  SELECT initiate_grp_withdrawal(
    :group_id, :pocket_id, :initiator_id, :amount, :reason, :recipients
  )
`);

export default (router: Router) => {
  router.post<Record<string, never>, StatusCodeInterface, WithdrawalValidation,
  Record<string, never>>(
    '/',
    validateRequest({
      body: withdrawalValidation
    }),
    authMiddleware(),
    async (req, res) => {
      await SQL_INITIATE_GRP_WITHDRAWAL({
        ...req.body,
        initiator_id: req.user!.id
      }).exec();
      res.sendStatus(201);
    }
  );
};