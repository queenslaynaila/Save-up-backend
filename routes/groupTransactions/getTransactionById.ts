import Router from '../../router';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import {
  TransactionRecipients,
  TransactionDetails,
  transactionInput,
  transactionDetails
} from './types';
import { z } from 'zod';

const SQL_GROUP_TRANSACTIONS = sql<TransactionRecipients, TransactionDetails >(`
  SELECT * FROM get_group_transaction_details(
    :user_id, :group_id, :transaction_id
);
`);

const getTransactionById = (router: Router) => {
  router.route({
    method: 'get',
    path: '/:id',
    summary: 'Get transacation by id',
    schema: {
      body: transactionInput,
      params: z.object({
        id: z.string()
      })
    },
    response: {
      schema: transactionDetails.array()
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      const members = await SQL_GROUP_TRANSACTIONS({
        user_id: req.user!.id,
        group_id: req.body.group_id,
        transaction_id: Number(req.params.id)
      }).many();
      return res.json(members);
    }
  });
};

export default getTransactionById;