import { Router } from 'express';
import { sql } from '../../db';
import validateRequest from '../../middleware/validationMiddleware';
import { StatusCodeInterface } from '../../globalTypes';
import { BaseGuarantee, GuaranteeLoanBody, guaranteeLoanBodySchema } from './types';

const SQL_GUARANTEE_LOAN = sql<BaseGuarantee, Record<string, never>>(`
  INSERT INTO  guarantor_approvals (group_id, request_id, guarantor_id, approval) 
  VALUES (:group_id, :request_id, :user_id, :approval);
`);

export default (router: Router) => {
  router.post<Record<string, never>, StatusCodeInterface, GuaranteeLoanBody,
  Record<string, never>>(
    '/',
    validateRequest({ body: guaranteeLoanBodySchema }),
    async (req, res) => {
      await SQL_GUARANTEE_LOAN({
        ...req.body,
        user_id: req.user!.id
      }).exec();
      res.sendStatus(201);
    }
  );
};