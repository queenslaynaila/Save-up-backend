import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import validateRequest from '../../middleware/validationMiddleware';
import { BaseRequestLoan, RequestLoan, requestLoanSchema } from './types';

const SQL_REQUEST_LOAN = sql<BaseRequestLoan, Record<string, never>>(`
  PERFORM request_loan(:group_id, :pocket_id, :borrower_id, :guarantor_id, :amount, :reason, :period)
`);

export default (router: Router) => {
  router.post<Record<string,never>, Record<string,never>, RequestLoan,
  Record<string,never>>(
    '/',
    validateRequest({ body:requestLoanSchema }),
    authMiddleware(),
    async (req, res) => {
      await SQL_REQUEST_LOAN({
        ...req.body,
        borrower_id:req.user!.id
      }).exec()
      return res.sendStatus(204);
    }
  );
};