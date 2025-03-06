import { z } from 'zod';
import { sql } from '../../db';
import Router from '../../router';
import { transactionSchema, transactionTypeSchema } from '../pockets/schema';

const transaction = transactionSchema.pick({
  xid: true,
  delta: true,
  balance: true,
  created_at: true
}).extend({
  slug: transactionTypeSchema.shape.slug,
  member_name: z.string().optional().nullable(),
  destination_pocket_name: z.string().optional().nullable(),
  source_pocket_name: z.string().optional().nullable()
});
type Transaction = z.infer<typeof transaction>;

const SQL_GET_TRANSACTIONS = sql<{entity_id: number, group_id: number|null}, Transaction>(`
  SELECT 
    transactions.xid, 
    transaction_types.slug,
    transactions.delta,
    transactions.balance,
    CASE
      WHEN CAST(:group_id AS INTEGER) IS NOT NULL THEN
        COALESCE(

          (SELECT user_contact_details.full_name 
           FROM group_deposits 
           JOIN user_contact_details 
             ON group_deposits.user_id = user_contact_details.id
           WHERE group_deposits.group_id = transactions.entity_id 
             AND group_deposits.deposit_id = transactions.xid),
          
          (SELECT user_contact_details.full_name 
           FROM disbursements 
           JOIN user_contact_details 
             ON disbursements.user_id = user_contact_details.id
           WHERE disbursements.group_id = transactions.entity_id 
             AND disbursements.transaction_id = transactions.xid),
          
          (SELECT user_contact_details.full_name 
           FROM group_transfers 
           JOIN user_contact_details 
             ON group_transfers.admin_id = user_contact_details.id
           WHERE group_transfers.group_id = transactions.entity_id 
             AND group_transfers.source_transaction_id = transactions.xid),

          (SELECT user_contact_details.full_name 
           FROM group_transfers 
           JOIN user_contact_details 
             ON group_transfers.admin_id = user_contact_details.id
           WHERE group_transfers.group_id = transactions.entity_id 
             AND group_transfers.destination_transaction_id = transactions.xid)
        )::TEXT
      ELSE NULL::TEXT
    END AS member_name,

    (SELECT pockets.name 
      FROM transactions source_transactions
      JOIN transaction_types source_transaction_types 
        ON source_transactions.type_id = source_transaction_types.id
      JOIN pockets 
        ON source_transactions.pocket_id = pockets.xid 
        AND pockets.entity_id = source_transactions.entity_id
      WHERE source_transactions.reference_id = transactions.reference_id 
        AND source_transaction_types.slug = 'TransferOut'
        AND source_transactions.entity_id = transactions.entity_id) AS source_pocket_name,

    (SELECT pockets.name 
    FROM transactions destination_transactions
    JOIN transaction_types destination_transaction_types 
      ON destination_transactions.type_id = destination_transaction_types.id
    JOIN pockets 
      ON destination_transactions.pocket_id = pockets.xid 
      AND pockets.entity_id = destination_transactions.entity_id
    WHERE destination_transactions.reference_id = transactions.reference_id 
      AND destination_transaction_types.slug = 'TransferIn'
      AND destination_transactions.entity_id = transactions.entity_id) AS destination_pocket_name,
  transactions.created_at
  FROM transactions
  JOIN transaction_types 
    ON transactions.type_id = transaction_types.id
    WHERE transactions.entity_id = :entity_id
`);

const getTransactions = (router: Router) => {
  router.route({
    method: 'get',
    path: '/:entity_id',
    summary: 'Get all transactions by a user, for a pocket, and groups',
    request: {
      params: z.object({
        entity_id: z.union([
          z.string().regex(/^[1-9]\d*$/, "Must be a positive integer string"),
          z.literal("me"), 
        ]).default('me' )
      }),
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
      const group_id = req.query.group_id ? Number(req.query.group_id) : null;
      const entity_id = parseInt(req.params.entity_id, 10);
      const { slug, pocket_id, from, to, limit = '10' } = req.query;

      const filters: string[] = [];
      const filterArgs: Record<string, string | number> = {
        entity_id,
        limit: Number(limit)
      };

      if (group_id) {
        filterArgs.group_id = group_id;
      }

      if (pocket_id) {
        filterArgs.pocket_id = Number(pocket_id);
        filters.push('transactions.pocket_id = :pocket_id');
      }

      if (slug) {
        filterArgs.slug = slug;
        filters.push('transaction_types.slug = :slug');
      }

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


      const query = SQL_GET_TRANSACTIONS({
        entity_id,
        group_id
      });

      if (filters.length > 0) {
        query.extend(`AND ${filters.join(' AND ')}`, filterArgs);
      }

      query.extend('ORDER BY transactions.created_at DESC LIMIT :limit', filterArgs);

      const transactions = await query.many();
      res.json(transactions);
    }
  });
};

export default getTransactions;