import Router from '../../router';
import { sql } from '../../db';
import authMiddleware from '../../authorization';
import { BaseRequestLoan, requestLoanSchema } from './types';

const SQL_REQUEST_LOAN = sql<BaseRequestLoan, Record<string, never>>(`
  SELECT request_loan(:group_id, :pocket_id, :borrower_id, :guarantor_id, :amount, :reason, :period)
`);

const createLoanRequest = (router: Router) => {
  router.route({
    method: 'post',
    path: '/',
    summary: 'Create a loan request',
    schema: {
      body: requestLoanSchema
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      await SQL_REQUEST_LOAN({
        ...req.body,
        borrower_id: req.user!.id
      }).exec();
      res.sendStatus(204);
    }
  });
};

export default createLoanRequest;