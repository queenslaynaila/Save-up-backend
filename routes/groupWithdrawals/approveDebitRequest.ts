import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import { decodeEntityAndVerifyAccess } from '../../utils';

const debitApprovalSchema = z.object({
  group_id:z.number().min(1),
  admin_id:z.number(),
  xid: z.number().int().min(1),
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
    schema: {
      params: z.object({
        group_id: z.number().int().min(1),
        xid: z.number().int().min(1)
      }),
      body: debitApprovalSchema.pick({
        status: true,
        reason: true
      }).extend({
      pin: z.string().regex(/^\d{4}$/)
      })
    },
    auth: true, 
    handler: async (req, res) => {
      const groupId = await decodeEntityAndVerifyAccess(req);

      await SQL_APPROVE_GRP_WITHDRAWAL({
        ...req.body,
        group_id:groupId,
        xid:req.params.xid,
        admin_id:req.user!.id
      }).exec();

      res.sendStatus(204);
    }
  });
};

export default reviewDebitRequests;