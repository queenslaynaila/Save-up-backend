import Router from '../../router';
import { sql } from '../../db';

import { depositByGroup, GroupDeposit } from './types';

const SQL_CREATE_GROUP_DEPOSIT = sql<GroupDeposit, Record<string, never>>(`
  SELECT * FROM create_group_deposit(:user_id, :group_id, :pocket_id, :amount)
`);

const createGroupDeposits = (router: Router) => {
  router.route({
    method: 'post',
    path: '/',
    summary: 'Deposit money to a group',
    schema: {
      body: depositByGroup
    },
    response: {
      statusCode: 201
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      await SQL_CREATE_GROUP_DEPOSIT({
        ...req.body,
        user_id: req.user!.id
      }).exec();
      res.sendStatus(201);
    }
  });
};

export default createGroupDeposits;