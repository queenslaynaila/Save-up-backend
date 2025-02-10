import Router from '../../router';
import { sql } from '../../db';
import { approveValidation, ApproveWithdrawal } from './types';

const SQL_APPROVE_GRP_WITHDRAWAL = sql<ApproveWithdrawal, Record<string, never>>(`
    SELECT approve_debit (
       :group_id, :request_id, :admin_id,  :status, :reason
    )
`);

const approveWithdrawal = (router: Router) => {
  router.route({
    method: 'post',
    path: '/',
    summary: 'Approve or reject group withdrawal',
    request: {
      body: approveValidation
    },
    response: {
      201: {}
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      await SQL_APPROVE_GRP_WITHDRAWAL({
        ...req.body,
        admin_id: req.user!.id
      }).exec();
      res.sendStatus(201);
    }
  });
};

export default approveWithdrawal;