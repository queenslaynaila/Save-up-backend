import Router from '../../router';
import { sql } from '../../db';
import authMiddleware from '../../authorization';
import { WithdrawalRequest, withdrawalValidation } from './types';

const SQL_INITIATE_GRP_WITHDRAWAL = sql<WithdrawalRequest, Record<string, never>>(`
  SELECT initiate_grp_withdrawal(
    :group_id, :pocket_id, :initiator_id, :amount, :reason, :recipients
  )
`);

const createGroupWithdrawal = (router: Router) => {
  router.route({
    method: 'post',
    path: '/',
    summary: 'Create a group withdrawal request',
    response: {
      statusCode: 201
    },
    schema: {
      body: withdrawalValidation
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      await SQL_INITIATE_GRP_WITHDRAWAL({
        ...req.body,
        initiator_id: req.user!.id
      }).exec();
      res.sendStatus(201);
    }
  });
};

export default createGroupWithdrawal;