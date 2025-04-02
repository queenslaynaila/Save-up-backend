import { z } from "zod";
import { sql } from "../../db";
import router from "../auth";
import { decodeEntityAndVerifyAccess } from "../../utils";

router.route({
    method: 'patch',
    path: '/:group_id/admins/review/:type/:id',
    summary: 'Approve or reject a loan/withdrawal request',
    auth: true, 
    schema: {
      params: z.object({
        group_id: z.number().int().min(1),
        type: z.enum(['loan', 'withdrawal']),
        id: z.number().int().min(1)
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
  