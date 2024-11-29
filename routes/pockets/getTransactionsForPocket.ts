import Router from '../../router';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { ParsedQs } from 'qs';
import { z } from 'zod';
import { transactionSchema, transactionTypeSchema } from './schema';

export const transaction = transactionSchema.pick({
  xid: true,
  delta: true,
  balance: true,
  created_at: true
}).extend({
  slug: transactionTypeSchema.shape.slug
});
export type Transaction = z.infer<typeof transaction>;

const SQL_GET_TRANSACTIONS = sql<{pocket_id:number, user_id:number}, Transaction>(`
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
    AND transactions.pocket_id = :pocket_id
  ORDER BY 
    transactions.created_at DESC
`);

const transactionQueryParams = z.object({
  from_date: z.string().optional(),
  to_date: z.string().optional()
}).extend({
  slug: transactionTypeSchema.shape.slug
}).partial();

const getTransactionsForPocket = (router: Router) => {
  router.route({
    method: 'get',
    path: '/:xid/transactions',
    summary: 'Get transactions for a pocket',
    middlewares: [authMiddleware()],
    schema: {
      query: transactionQueryParams,
      params: z.object({ xid: z.string() })
    },
    response: {
      schema: z.array(transaction)
    },
    handler: async (req, res) => {
      const { slug, from_date, to_date } = req.query;
      const filters: string[] = [];
      const filterArgs: string | string [] | ParsedQs | ParsedQs[] = {};
      if (slug) {
        filterArgs.slug = slug;
        filters.push('transactions.slug = :slug');
      }
      if (from_date && to_date) {
        filterArgs.from_date = from_date;
        filterArgs.to_date = to_date;
        filters.push('transactions.created_at BETWEEN :from_date AND :to_date');
      } else {
        if (from_date) {
          filterArgs.from_date = from_date;
          filters.push('transactions.created_at >= :from_date');
        }
        if (to_date) {
          filterArgs.to_date = to_date;
          filters.push('transactions.created_at <= :to_date');
        }
      }

      const query = SQL_GET_TRANSACTIONS({
        pocket_id: Number(req.params.xid),
        user_id: req.user!.id
      });
      if (filters.length > 0) query.extend(`AND ${filters.join(' AND ')}`, filterArgs);
      query.extend('LIMIT 15', {});

      return res.json(await query.many());
    }
  });
};

export default getTransactionsForPocket;