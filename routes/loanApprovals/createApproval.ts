import Router from '../../router';
import { sql } from '../../db';

import { AdminLoanApproval, loanApprovalSchema } from './types';

const SQL_APPROVE_LOAN = sql<AdminLoanApproval, Record<string, never>>(`
  SELECT approve_loan (:group_id, :request_id, :admin_id, :status, :reason);
`);

const createApproval = (router: Router) => {
  router.route({
    method: 'post',
    path: '/',
    summary: 'Approve loan',
    request: {
      body: loanApprovalSchema
    },
    response: {
      204: {}
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      await SQL_APPROVE_LOAN({
        ...req.body,
        admin_id: req.user!.id
      }).exec();
      res.sendStatus(204);
    }
  });
};

export default createApproval;