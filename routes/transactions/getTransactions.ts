import { z } from 'zod';
import { sql } from '../../db';
import Router from '../../router';
import logger from '../../logger';
import { transactionSchema, transactionTypeSchema } from '../pockets/schema';
import { group } from 'console';

const transaction = transactionSchema.pick({
  xid: true,
  delta: true,
  balance: true,
  created_at: true
}).extend({
  slug: transactionTypeSchema.shape.slug,
  member_name: z.string().optional().nullable()
});
type Transaction = z.infer<typeof transaction>;

const SQL_GET_TRANSACTIONS = sql<{group_id?:number}, Transaction>(`
    SELECT 
      transactions.xid, 
      transaction_types.slug,
      transactions.delta,
      transactions.balance,
      CASE 
        WHEN :group_id IS NOT NULL THEN 
          COALESCE(deposit_user.full_name, disbursement_user.full_name) 
        ELSE 
          NULL 
        END AS member_name,
      transactions.created_at
    FROM 
      transactions
    JOIN 
      transaction_types ON transactions.type_id = transaction_types.id
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
      const group_id = req.query.group_id ? Number(req.query.group_id) : undefined;
      const entity_id = group_id || req.user!.id;
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

      const query = SQL_GET_TRANSACTIONS({group_id});

      if (group_id) {
        query.extend('LEFT JOIN ' +
          'group_deposits ON transactions.entity_id = group_deposits.group_id ' +
            'AND transactions.xid = group_deposits.deposit_id ' +
          'LEFT JOIN ' +
            'user_contact_details AS deposit_user ON group_deposits.user_id = deposit_user.id ' +
          'LEFT JOIN ' +
            'disbursements ON transactions.entity_id = disbursements.group_id ' +
            'AND transactions.xid = disbursements.transaction_id ' +
          'LEFT JOIN ' +
            'user_contact_details AS disbursement_user ON disbursements.user_id = disbursement_user.id'
        , {});
      }

      query.extend('WHERE transactions.entity_id = :entity_id', {entity_id});

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