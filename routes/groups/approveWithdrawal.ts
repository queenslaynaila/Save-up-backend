import Router from '../../router';
import { sql } from '../../db';

import { ApproveWithdrawal, withdrawal } from './types';
import { z } from 'zod';

const SQL_APPROVE_GRP_WITHDRAWAL = sql<ApproveWithdrawal, Record<string, never>>(`
    SELECT approve_group_withdrawal(
      :group_id, :admin_id, :election_id, :withdrawal_id, :status, :reason
    )
`);

const approveWithdrawal = (router:Router) => {
  router.route({
    method: 'post',
    path: '/approve-withdrawal/:id',
    summary: 'Approve withdrwawal',
    schema: {
      params: z.object({
        id: z.string()
      }),
      body: withdrawal
    },
    response: {
      statusCode: 201
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      await SQL_APPROVE_GRP_WITHDRAWAL({
        ...req.body,
        group_id: Number(req.params.id),
        admin_id: req.user!.id
      }).exec();
      res.sendStatus(201);
    }
  });
};

export default approveWithdrawal;