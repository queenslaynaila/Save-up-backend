import { z } from "zod";
import { sql } from "../../db";
import { decodeEntityAndVerifyAccess } from "../../utils";
import Router from "../../router";

const SQL_REVIEW_DEBIT = sql<{
  group_id:number;
  debit_id:number,
  admin_id:number;
  status:'Approved'|'Rejected'|'Cancelled';
  reason:string
}, Record<string, never>>(`
  SELECT review_debit_request(
    :group_id, 
    :debit_id, 
    :admin_id, 
    :status,
    :reason
  )
`);

const reviewDebitRequests = (router: Router) => {
router.patch({
    path: '/groups/:group_id/debits/:debit_id/review',
    summary: 'Approve or reject a loan/withdrawal request',
    auth: true,
    schema: {
      params: z.object({
        group_id: z.number().int().min(1),
        debit_id: z.number().int().min(1)
      }),
      body: z.object({
        status: z.enum([ 'Approved','Rejected','Cancelled']),
        reason: z.string()
      })
    },
    handler: async (req, res) => {
      const groupId = await decodeEntityAndVerifyAccess(req,false,true)

      await SQL_REVIEW_DEBIT({
        ...req.body,
        group_id: groupId,
        debit_id: req.params.debit_id,
        admin_id:req.user!.id
      }).exec()

      res.sendStatus(200);
    }
  });
}

export default reviewDebitRequests;