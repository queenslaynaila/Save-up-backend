import { z } from 'zod';
import Router from '../../router';
import { sql } from '../../db';
import { decodeEntityAndVerifyAccess } from '../../utils';

const guarantorSchema = z.object({
  id: z.number().int().min(1),
  name: z.string(),
  status: z.enum(['pending', 'approved', 'rejected'])
});

const adminReviewSchema = z.object({
  id: z.number().int().min(1),
  name: z.string(),
  status: z.enum(['pending', 'approved', 'rejected']),
  reason: z.string()
});

const loanRequestSchema = z.object({
  xid: z.number().int().min(1),
  requested_by_id: z.number().int().min(1),
  requested_by_name: z.string(),
  amount: z.number(),
  reason: z.string(),
  requested_at: z.string().datetime(),
  status: z.string(),
  repayment_period: z.string(),
  guarantors: z.array(guarantorSchema),
  admin_reviews: z.array(adminReviewSchema)
});

type LoanRequest = z.infer<typeof loanRequestSchema>;

const SQL_GET_LOANS = sql<{ group_id: number }, LoanRequest>(`
  SELECT get_loan_requests(:group_id)
`);

const getLoanRequests = (router: Router) => {
  router.route({
    method: 'get',
    path: '/:group_id',
    summary: 'Get loan request',
    request: {
      params: z.object({
        group_id: z.number().int().min(1)
      })
    },
    response: {
      200: {
        schema: z.array(loanRequestSchema)
      }
    },
    auth: true,
    handler: async (req, res) => {
      const groupId = await decodeEntityAndVerifyAccess(req, true)
      await SQL_GET_LOANS({
        group_id: groupId,
        ...req.body
      }).exec();
      res.sendStatus(201);
    }
  });
};

export default getLoanRequests;
