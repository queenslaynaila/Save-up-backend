import { z } from 'zod';
import { sql } from '../../db';
import Router from '../../router';
import verifyGroupMembership, { decodeEntityOrUserId } from '../../utils';
import { entityIdParamsSchema } from '../users/schema';

const ENUM_TRANSACTION_TYPE = z.enum([
  'Saving',
  'ExternalSaving',
  'Interest',
  'Withdrawal',
  'Penalty',
  'TransferIn',
  'TransferOut',
  'Loan',
  'Repayment'
]);

export const transactionTypeSchema = z.object({
  id: z.number(),
  slug: ENUM_TRANSACTION_TYPE,
  created_at: z.string().datetime()
});

export const transactionSchema = z.object({
  entity_id: z.number().min(1),
  xid: z.number().min(1),
  type_id: z.number(),
  pocket_id: z.number().min(1),
  reference_id: z.number(),
  delta: z.number().min(5),
  balance: z.number(),
  created_at: z.string().datetime()
});

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

const SQL_GET_TRANSACTIONS = sql<
  { 
    entity_id: number, 
    pocket_id?: number, 
    slug?: string, 
    from?: string, 
    to?: string, 
    limit: number 
  }, 
  Transaction
>(`
  SELECT 
    transactions.xid, 
    transaction_types.slug,
    transactions.delta,
    transactions.balance,
    CASE 
      WHEN (SELECT entity_type FROM entities WHERE id = transactions.entity_id) = 'Group' THEN
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
    (SELECT pockets.name FROM transactions source_transactions
      JOIN transaction_types source_transaction_types 
        ON source_transactions.type_id = source_transaction_types.id
      JOIN pockets 
        ON source_transactions.pocket_id = pockets.xid 
        AND pockets.entity_id = source_transactions.entity_id
      WHERE source_transactions.reference_id = transactions.reference_id 
        AND source_transaction_types.slug = 'TransferOut'
        AND source_transactions.entity_id = transactions.entity_id) AS source_pocket_name,
    (SELECT pockets.name FROM transactions destination_transactions
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
    AND (:pocket_id::INT IS NULL OR transactions.pocket_id = :pocket_id)
    AND (:slug::TEXT IS NULL OR transaction_types.slug = :slug)
    AND (:from::DATE IS NULL OR DATE(transactions.created_at) >= :from)
    AND (:to::DATE IS NULL OR DATE(transactions.created_at) <= :to)
  ORDER BY transactions.created_at DESC
  LIMIT :limit
`);

const getTransactions = (router: Router) => {
  router.route({
    method: 'get',
    path: '/:entity_id',
    summary: 'Get all transactions by a system entity',
    request: {
      params: z.object({
        entity_id: entityIdParamsSchema
      }),
      query: z.object({
        slug: transactionTypeSchema.shape.slug,
        pocket_id: z.string().optional(),
        from: z.string().date().optional(),
        to: z.string().date().optional(),
        limit: z.string().default('10')
      }).partial()
    },
    response: {
      200: {
        schema: z.array(transaction)
      }
    },
    auth: true,
     middlewares: [
      verifyGroupMembership({
        isOwnerOrAdminMod: true
      })
    ],
    handler: async (req, res) => {
      const entityId = decodeEntityOrUserId(req, true);
      const pocket_id = req.query.pocket_id 
      ? Number(req.query.pocket_id) 
      : undefined;

      const { slug, from, to, limit = '10' } = req.query;

      const transactions = await SQL_GET_TRANSACTIONS({
        entity_id: entityId,
        pocket_id,
        slug,
        from,
        to,
        limit: Number(limit)
      }).many();

      res.json(transactions);
    }
  });
};

export default getTransactions;