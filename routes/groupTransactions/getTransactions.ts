import Router from '../../router';
import { sql } from '../../db';
import authMiddleware from '../../authorization';
import {
  TransactionByGroup,
  BaseTransaction,
  transactionByPkt,
  baseTransaction
} from './types';

const SQL_GROUP_TRANSACTIONS = sql<TransactionByGroup, BaseTransaction>(`
  SELECT * FROM get_group_transactions(:group_id, :user_id, :pocket_id);
`);

const getTransactions = (router: Router) => {
  router.route({
    method: 'get',
    path: '/',
    summary: 'Get list of transactions by group',
    schema: {
      body: transactionByPkt
    },
    response: {
      schema: baseTransaction.array()
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      const transactions = await SQL_GROUP_TRANSACTIONS({
        ...req.body,
        user_id: req.user!.id
      }).many();
      res.json(transactions);
    }
  });
};

export default getTransactions;