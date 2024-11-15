import Router from '../../router';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { FinalnApproval, finalApprovalBody } from './types';

const SQL_COMPUTE_APPROVALS = sql< FinalnApproval, Record<string, never>>(`
  SELECT compute_loan_approvals(:group_id, :request_id, :admin_id );
`);

const computeApprovals = (router: Router) => {
  router.route({
    method: 'post',
    path: '/',
    summary: 'Compute loan approvals',
    schema: {
      body: finalApprovalBody
    },
    response: {
      statusCode: 204
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      await SQL_COMPUTE_APPROVALS({
        ...req.body,
        admin_id: req.user!.id
      }).exec();
      res.sendStatus(204);
    }
  });
};

export default computeApprovals;