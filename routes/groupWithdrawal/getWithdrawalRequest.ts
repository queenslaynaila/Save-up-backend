import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';

const Approval = z.object({
  admin_name: z.string(),
  status: z.string(),
  reason: z.string()
});

const WithdrawalRequest = z.object({
  withdrawal_id: z.number(),
  amount: z.number(),
  reason: z.string(),
  approvals: z.array(Approval)
});

export type WithdrawalRequestType = z.infer<typeof WithdrawalRequest>;

const SQL_INITIATE_GRP_WITHDRAWAL = sql<{group_id:number; user_id:number}, WithdrawalRequestType>(`
  SELECT * FROM get_withdrawal_requests(
    :group_id,
    :user_id,
  )
`);

const getGroupWithdrawals = (router: Router) => {
  router.route({
    method: 'get',
    path: '/',
    summary: 'Get all withdrawal requests made to a group',
    response: {
      200: {
        schema: z.array(WithdrawalRequest)
      } 
    },
    request: {
      query: z.object({
        group_id: z.number()
      })
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
     const withdrawals = await SQL_INITIATE_GRP_WITHDRAWAL({
        group_id: req.query.group_id,
        user_id: req.user!.id
      }).many();
      res.json(withdrawals);
    }
  });
};

export default getGroupWithdrawals;