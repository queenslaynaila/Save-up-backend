import { z } from 'zod';
import { sql } from '../../db';
import HttpError from '../../httpError';
import Router from '../../router';
import { transaction, Transaction } from '../pockets/getTransactionsForPocket';
import { UserRole } from '../../types';
import { transactionTypeSchema } from '../pockets/schema';

const SQL_GET_TRANSACTIONS_FOR_USER = sql<{user_id:number}, Transaction>(`
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
`);

const getTransactionsForUser = (router: Router) => {
  router.route({
    method: 'get',
    path: '/:user_id/transactions',
    summary: 'Retrieve transactions for user.',
    description: 'This endpoint allows fetching financial transactions related to a user. The "userId" param can represent different identifiers, including:\n'
  + '- **user_id**: A user’s  unique identifier.\n'
  + '- **"me"**: The string "me" can be used to fetch details of the currently logged-in user.\n\n'
  + 'Standard users can only access their own details by using "me", or their own userid while moderators and admins have access to query any user using  the user_id. \n'
  + 'The path automatically shows the last 10 transactions if no limit has been requested but it allows the client to specify a limit and transaction type as query params.',
    schema: {
      params: z.object({
        user_id: z.string()
      }),
      query: z.object({
        slug: transactionTypeSchema.shape.slug,
        start_at: z.string().date().optional(),
        end_at: z.string().date().optional(),
        limit: z.string().optional().default('10')
      }).partial()
    },
    response: {
      schema: z.array(transaction)
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const user_id = req.params.user_id;
      const targetUserId = user_id === 'me' || user_id === undefined
        ? req.user!.id : parseInt(user_id!, 10);

      if (Number.isNaN(targetUserId)) {
        throw new HttpError(400);
      }

      if (req.user!.role === UserRole.USER && targetUserId !== req.user!.id) {
        throw new HttpError(403);
      }

      const { slug, limit = 10, start_at, end_at } = req.query;

      const filters: string[] = [];
      const filterArgs: Record<string, string | number> = { limit };

      if (slug) {
        filters.push('transaction_types.slug = :slug');
        filterArgs.slug = slug;
      }
      if (start_at) {
        filters.push('DATE(transactions.created_at) >= :start_at');
        filterArgs.start_at = start_at;
      }

      if (end_at) {
        filters.push('DATE(transactions.created_at) <= :end_at');
        filterArgs.end_at = end_at;
      }

      const query = SQL_GET_TRANSACTIONS_FOR_USER({
        user_id: targetUserId
      });

      if (filters.length > 0) query.extend(`AND ${filters.join(' AND ')}`, filterArgs);

      query.extend('ORDER BY transactions.created_at DESC LIMIT :limit', filterArgs);
      const transactions = await query.many();
      return res.json(transactions);
    }
  });
};

export default getTransactionsForUser;