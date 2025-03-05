import Router from '../../router';
import { sql } from '../../db';
import { approveValidation, ApproveWithdrawal } from './types';
import { z } from 'zod';
import { verifyPin } from '../../utils';

const SQL_APPROVE_GRP_WITHDRAWAL = sql<ApproveWithdrawal, Record<string, never>>(`
  SELECT approve_debit(
    :group_id,
    :request_id,
    :admin_id,
    :status,
    :reason
  )
`);

const approveWithdrawal = (router: Router) => {
  router.route({
    method: 'post',
    path: '/',
    summary: 'Approve or reject group withdrawal',
    description: 'Allows admins to approve or reject withdrawal requests with PIN verification',
    request: {
      body: approveValidation.extend({
        pin: z.number().min(1000).max(9999)
      })
    },
    response: {
      201: {},
      403: { schema: z.object({ message: z.string() }) }
    },
    authMiddlewareOptions: {},
    middlewares:[verifyPin],
    handler: async (req, res) => {
      const { pin, ...approvalData } = req.body;

      await SQL_APPROVE_GRP_WITHDRAWAL({
        ...approvalData,
        admin_id: req.user!.id
      }).exec();

      res.sendStatus(201);
    }
  });
};

export default approveWithdrawal;