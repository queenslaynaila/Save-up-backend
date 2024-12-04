import { sql } from '../../db';

import { withdrawalBodySchema, WithdrawalCreation } from './types';
import HttpError from '../../httpError';
import Router from '../../router';

const SQL_CREATE_WITHDRAWAL = sql<WithdrawalCreation, Record<string, never>>(`
  SELECT create_user_withdrawal(:user_id, :pocket_id, :amount);
`);

const createWithdrawal = (router: Router) => {
  router.route({
    method: 'post',
    path: '/',
    summary: 'Withdraw from a pocket',
    schema: {
      body: withdrawalBodySchema
    },
    response: {
      statusCode: 201
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      await SQL_CREATE_WITHDRAWAL({
        ...req.body,
        user_id: req.user!.id
      }).exec().catch((err) => {
        if (err.code === 'P0004') {
          throw new HttpError(400, { message: 'ERR_INSUFFICIENT_FUNDS' });
        }
        if (err.code === 'P0005') {
          throw new HttpError(400, { message: 'ERR_FUNDS_LOCKED' });
        }
      });
      res.sendStatus(201);
    }
  });
};

export default createWithdrawal;