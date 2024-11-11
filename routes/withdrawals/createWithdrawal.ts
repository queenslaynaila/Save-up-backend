import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import validateRequest from '../../middleware/validationMiddleware';
import {
  WithdrawalBody,
  withdrawalBodySchema,
  WithdrawalCreation
} from './types';
import { StatusCodeInterface } from '../../globalTypes';
import { HttpError } from '../../middleware/errorMiddleware';

const SQL_CREATE_WITHDRAWAL = sql<WithdrawalCreation, Record<string, never>>(`
  SELECT create_user_withdrawal(:user_id, :pocket_id, :amount);
`);

export default (router: Router) => {
  router.post<Record<string, never>, StatusCodeInterface, WithdrawalBody,
  Record<string, never>>(
    '/',
    validateRequest({ body: withdrawalBodySchema }),
    authMiddleware(),
    async (req, res) => {
      await SQL_CREATE_WITHDRAWAL({
        ...req.body,
        user_id: req.user!.id
      }).exec().catch((err) => {
        if (err.code === 'P0005') {
          throw new HttpError(400, { message: 'ERR_FUNDS_LOCKED' });
        }
      });
      res.sendStatus(201);
    }
  );
};