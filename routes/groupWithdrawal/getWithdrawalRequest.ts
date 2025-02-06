import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import { pocket } from '../pockets/createPocket';

const Approval = z.object({
  admin_name: z.string(),
  status: z.string(),
  reason: z.string()
});

const WithdrawalRequest = z.object({
  withdrawal_id: z.number(),
  requested_by: z.string(),
  recipient_name: z.string(),
  amount: z.number(),
  reason: z.string(),
  requested_at: z.string(),
  approvals: z.array(Approval)
});

export type WithdrawalRequestType = z.infer<typeof WithdrawalRequest>;

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