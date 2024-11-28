import { z } from 'zod';
import { sql } from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
import Router from '../../router';
import { transaction, Transaction } from '../pockets/getTransactionsForPocket';
import { UserRole } from '../../globalTypes';

const SQL_GET_TRANSACTIONS_FOR_USER = sql<{user_id:number, limit:number}, Transaction>(`
  SELECT 
    transactions.xid, 
    transaction_types.slug,
    transactions.delta,
    transactions.balance,
    transactions.created_at
  FROM 
    transactions
  JOIN 
    transaction_types ON transactions.type_id = transaction_types.id
  WHERE 
    transactions.entity_id = :user_id
  ORDER BY 
    transactions.created_at DESC
  LIMIT :limit;
`);

const getTransactionsForUser = (router: Router) => {
  router.route({
    method: 'get',
    path: '/:user_id/transactions',
    summary: 'Retrieve transactions for user.',
    description: 'This endpoint allows fetching financial transactions related to a user. The "userId" param can represent different identifiers, including:\n'
  + '- **user_id**: A user’s  unique identifier.\n'
  + '- **"me"**: The string "me" can be used to fetch details of the currently logged-in user.\n\n'
  + 'Standard users can only access their own details by using "me", or their own userid while moderators and admins have access to query any user using any of the above identifiers.',
    schema: {
      params: z.object({
        user_id: z.string()
      }),
      query: z.object({
        limit: z.number().optional().default(5)
      })
    },
    response: {
      schema: z.array(transaction)
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const param = req.params.user_id;
      const user_id = param === 'me' ? req.user!.id : parseInt(param, 10);

      if (Number.isNaN(user_id)) {
        throw new HttpError(400);
      }

      if (req.user!.role === UserRole.USER && user_id !== req.user!.id) {
        throw new HttpError(403);
      }

      const limit = req.query.limit || 5;
      const transactions = await SQL_GET_TRANSACTIONS_FOR_USER({
        user_id,
        limit
      }).many();
      return res.json(transactions);
    }
  });
};

export default getTransactionsForUser;