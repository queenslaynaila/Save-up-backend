import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import verifyGroupMembership from '../../utils';

const Approval = z.object({
  user_id: z.string(),
  full_name: z.string(),
  status: z.string(),
  reason: z.string()
});

const WithdrawalRequest = z.object({
  xid: z.number(),
  requested_by_id: z.number(),
  requested_by: z.string(),
  recipient_id: z.number(),
  recipient_name: z.string(),
  amount: z.number(),
  reason: z.string(),
  requested_at: z.string(),
  status: z.string(),
  reviews: z.array(Approval).nullable()
});

type WithdrawalRequestType = z.infer<typeof WithdrawalRequest>;

const SQL_INITIATE_GRP_WITHDRAWAL = sql<{group_id:number; user_id:number, pocket_id:number}, WithdrawalRequestType>(`
  SELECT * FROM get_withdrawal_requests(
    :group_id,
    :user_id,
    :pocket_id
  )
`);

const getGroupWithdrawals = (router: Router) => {
  router.route({
    method: 'get',
    path: '/',
    summary: 'Get all withdrawal requests made to a group pocket',
    response: {
      200: {
        schema: z.array(WithdrawalRequest)
      } 
    },
    request: {
      query: z.object({
        group_id: z.string(),
        pocket_id: z.string()
      })
    },
    authMiddlewareOptions: {}, 
    middlewares: [verifyGroupMembership({allowModeratorAccess: true})],
    handler: async (req, res) => {
     const withdrawals = await SQL_INITIATE_GRP_WITHDRAWAL({
        group_id: Number(req.query.group_id),
        pocket_id: Number(req.query.pocket_id),
        user_id: req.user!.id
      }).many();
      res.json(withdrawals);
    }
  });
};

export default getGroupWithdrawals;