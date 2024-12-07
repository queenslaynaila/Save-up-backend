import { z } from 'zod';
import { sql } from '../../db';
import Router from '../../router';
import logger from '../../logger';
import { transactionSchema, transactionTypeSchema } from '../pockets/schema';

const transaction = transactionSchema.pick({
  xid: true,
  delta: true,
  balance: true,
  created_at: true
}).extend({
  slug: transactionTypeSchema.shape.slug
});
export type Transaction = z.infer<typeof transaction>;

const SQL_GET_TRANSACTIONS = sql<{ entity_id: number }, Transaction>(`
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
      transactions.entity_id = :entity_id
  `);

const getTransactions = (router: Router) => {
  router.route({
    method: 'get',
    path: '/',
    summary: 'Get all transactions by a user, for a pocket, and groups',
    request: {
      query: z.object({
        group_id: z.string().optional(),
        slug: transactionTypeSchema.shape.slug,
        pocket_id: z.string().optional(),
        from: z.string().optional(),
        to: z.string().optional(),
        limit: z.string().default('10')
      }).partial()
    },
    response: {
      200: {
        schema: z.array(transaction)
      }
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const entity_id = Number(req.query?.group_id) || req.user!.id;
      const { slug, pocket_id, from, to, limit = '10' } = req.query;

      const filters: string[] = [];
      const filterArgs: Record<string, string | number> = { entity_id, limit: Number(limit) };

      logger.info(`pocket is ${pocket_id}`);

      if (pocket_id) {
        filterArgs.pocket_id = pocket_id;
        filters.push('transactions.pocket_id = :pocket_id');
      }

      if (slug) {
        filterArgs.slug = slug;
        filters.push('transaction_types.slug = :slug');
      }

      logger.info(`type is ${slug}`);

      if (from && to) {
        filterArgs.start_date = from;
        filterArgs.end_date = to;
        filters.push('DATE(transactions.created_at) BETWEEN :start_date AND :end_date');
      } else {
        if (from) {
          filterArgs.start_date = from;
          filters.push('DATE(transactions.created_at) >= :start_date');
        }

        if (to) {
          filterArgs.end_date = to;
          filters.push('DATE(transactions.created_at) <= :end_date');
        }
      }

      logger.info(`from and to is ${from} and to is ${to}`);

      const query = SQL_GET_TRANSACTIONS({
        entity_id
      });

      if (filters.length > 0) {
        query.extend(`AND ${filters.join(' AND ')}`, filterArgs);
      }
      query.extend('ORDER BY transactions.created_at DESC LIMIT :limit', filterArgs);

      logger.info(`full query is ${JSON.stringify(query)}`);

      const transactions = await query.many();
      res.json(transactions);
    }
  });
};

export default getTransactions;