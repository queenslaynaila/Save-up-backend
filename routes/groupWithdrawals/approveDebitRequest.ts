import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import verifyGroupMembership, { verifyPin } from '../../utils';

const debitApprovalSchema = z.object({
  group_id:z.number().min(1),
  admin_id:z.number(),
  xid: z.number(),
  status: z.enum(['Rejected', 'Approved', 'Pending']),
  reason: z.string()
});

export type ApproveWithdrawal = z.infer<typeof debitApprovalSchema>;

const SQL_APPROVE_GRP_WITHDRAWAL = sql<ApproveWithdrawal, Record<string, never>>(`
  SELECT approve_debit(
    :group_id,
    :request_id,
    :admin_id,
    :status,
    :reason
  )
`);

const reviewDebitRequests = (router: Router) => {
  router.route({
    method: 'patch',
    path: '/:group_id/:xid',
    summary: 'Approve or decline a debit request',
    request: {
      params: z.object({
        group_id: z.string().regex(/^[1-9]\d*$/),
        xid: z.string().regex(/^[1-9]\d*$/)
      }),
      body: debitApprovalSchema.pick({
        status: true,
        reason: true
      }).extend({
        pin: z.number().min(1000).max(9999)
      })
    },
    auth: true,
    middlewares: [
      verifyPin,
      verifyGroupMembership({ 
        requiresGrpAdmin:true
     })
    ],
    handler: async (req, res) => {
      const { group_id, xid } = req.params;
      const { status, reason } = req.body;

      await SQL_APPROVE_GRP_WITHDRAWAL({
        group_id:Number(group_id),
        xid:Number(xid),
        status,
        reason,
        admin_id:req.user!.id
      }).exec();

      res.sendStatus(204);
    }
  });
};

export default reviewDebitRequests;