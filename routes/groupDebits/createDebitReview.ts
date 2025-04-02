import { z } from "zod";
import { sql } from "../../db";
import router from "../auth";
import { decodeEntityAndVerifyAccess } from "../../utils";
import Router from "../../router";

const reviewDebitRequests = (router: Router) => {
router.route({
    method: 'patch',
    path: '/:group_id/admins/review/:debit_id',
    summary: 'Approve or reject a loan/withdrawal request',
    auth: true, 
    schema: {
      params: z.object({
        group_id: z.number().int().min(1),
        debit_id: z.number().int().min(1)
      }),
      body: z.object({
        status: z.enum(['approved', 'rejected']),
        reason: z.string().optional()
      })
    },
    handler: async (req, res) => {
      const groupId = await decodeEntityAndVerifyAccess(req,false,true)
      const { status, reason } = req.body;
  
    

    }
  });
} 

export default reviewDebitRequests;