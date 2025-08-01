import { z } from 'zod';
import Router from '../../new/router';
import { sql } from '../../db';
import { decodeEntityAndVerifyAccess } from '../../utils';
import { entityIdParamsSchema } from './schema';

const emptyMetadata = z.object({}).nullable();

const transferMetadata = z.object({
  source_pocket: z.object({
    id: z.number(),
    name: z.string()
  }),
  destination_pocket: z.object({
    id: z.number(),
    name: z.string()
  })
}).nullable();

const withdrawalRequestMetadata = z.object({
  reason: z.string(),
  recipients: z.array(z.object({
    id: z.number(),
    name: z.string(),
    amount: z.number()
  }))
}).nullable();

const withdrawalStatusMetadata = z.object({
  reason: z.string(),
  status: z.enum(['Approved', 'Rejected'])
}).nullable();

const loanMetadata = z.object({
  reason: z.string(),
  status: z.enum(['Approved', 'Rejected', 'Pending Guarantors'])
}).nullable();

const activitySchema = z.object({
  id: z.number(),
  actor_id: z.number().int().min(1),
  actor_name: z.string(),
  created_at: z.string().datetime(),
  target_id: z.number().int().min(1).nullable(),
  target_name: z.string().nullable(),
  pocket_id: z.number().int().min(1).nullable(),
  pocket_name: z.string().nullable(),
  amount: z.number().nullable(),
  type: z.enum([
    'MemberJoined',
    'MemberLeft',
    'MemberRemoved',
    'Deposit',
    'Transfer',
    'WithdrawalRequest',
    'WithdrawalApproval',
    'WithdrawalRejection',
    'LoanRequest'
  ]),
  metadata: z.union([
    emptyMetadata,
    transferMetadata,
    withdrawalRequestMetadata,
    withdrawalStatusMetadata,
    loanMetadata
  ])
});

type Activity = z.infer<typeof activitySchema>;

const SQL_GET_GROUP_ACTIVITIES = sql<
{ group_id: number, size: number },
Activity>(`
    SELECT *
    FROM (
        (
            SELECT
                'MemberJoined' AS type, 
                group_joins.xid AS id,
                group_joins.user_id AS actor_id,
                user_contact_details.full_name AS actor_name,
                NULL::INT AS target_id, 
                NULL::TEXT AS target_name, 
                NULL::INT AS pocket_id, 
                NULL::TEXT AS pocket_name,
                NULL::NUMERIC AS amount, 
                NULL::JSONB AS metadata,
                group_joins.created_at
            FROM group_joins
            JOIN user_contact_details 
                ON group_joins.user_id = user_contact_details.id
            WHERE group_joins.group_id = :group_id
            ORDER BY group_joins.created_at DESC
            LIMIT :size
        )

        UNION ALL 

        (
            SELECT 
                'MemberLeft' AS type,
                group_lefts.xid AS id,
                group_lefts.user_id AS actor_id,
                user_contact_details.full_name AS actor_name,
                NULL::INT AS target_id,  
                NULL::TEXT AS target_name, 
                NULL::INT AS pocket_id, 
                NULL::TEXT AS pocket_name,
                NULL::NUMERIC AS amount, 
                NULL::JSONB AS metadata,
                group_lefts.created_at
            FROM group_lefts
            JOIN user_contact_details 
                ON user_contact_details.id = group_lefts.user_id
            WHERE group_lefts.group_id = :group_id
            AND group_lefts.reason = 'Self removal'
            ORDER BY group_lefts.created_at DESC
            LIMIT :size
        )

        UNION ALL

        (
            SELECT 
                'MemberRemoved' AS type,
                group_lefts.xid AS id,
                group_lefts.admin_id AS actor_id,
                admin_details.full_name AS actor_name,
                group_lefts.user_id AS target_id, 
                target_details.full_name AS target_name,
                NULL::INT AS pocket_id, 
                NULL::TEXT AS pocket_name,
                NULL::NUMERIC AS amount, 
                NULL::JSONB AS metadata,
                group_lefts.created_at
            FROM group_lefts
            JOIN user_contact_details AS admin_details 
                ON admin_details.id = group_lefts.admin_id
            JOIN user_contact_details AS target_details 
                ON target_details.id = group_lefts.user_id
            WHERE group_lefts.reason = 'Admin removal'
            AND group_lefts.group_id = :group_id
            ORDER BY group_lefts.created_at DESC
            LIMIT :size
        )

        UNION ALL

        (
           SELECT 
                'Deposit' AS type,
                group_deposits.deposit_id AS id,
                group_deposits.user_id AS actor_id,
                user_contact_details.full_name AS actor_name,
                NULL::INT AS target_id,  
                NULL::TEXT AS target_name,
                transactions.pocket_id,
                pockets.name AS pocket_name,
                transactions.delta AS amount,
                NULL::JSONB AS metadata,
                transactions.created_at
            FROM group_deposits
            JOIN transactions 
                ON transactions.entity_id = group_deposits.group_id
                AND transactions.xid = group_deposits.deposit_id
            JOIN user_contact_details 
                ON user_contact_details.id = group_deposits.user_id
            LEFT JOIN pockets 
                ON pockets.xid = transactions.pocket_id
                AND pockets.entity_id = group_deposits.group_id
            WHERE group_deposits.group_id = :group_id
            ORDER BY transactions.created_at DESC
            LIMIT :size
        )

        UNION ALL

        (
            SELECT 
                'Transfer' AS type,
                group_transfers.source_transaction_id AS id,
                group_transfers.admin_id AS actor_id,
                user_contact_details.full_name AS actor_name,
                NULL::INT AS target_id,  
                NULL::TEXT AS target_name,
                NULL::INT AS pocket_id,
                NULL::TEXT AS pocket_name,
                ABS(src_transactions.delta) AS amount,
                jsonb_build_object(
                    'source_pocket', jsonb_build_object(
                        'id', src_pockets.xid,
                        'name', src_pockets.name
                    ),
                    'destination_pocket', jsonb_build_object(
                        'id', dest_pockets.xid,
                        'name', dest_pockets.name
                    )
                )::JSONB AS metadata,
                group_transfers.created_at
            FROM group_transfers
            JOIN transactions AS src_transactions 
                ON src_transactions.entity_id = group_transfers.group_id
                AND src_transactions.xid = group_transfers.source_transaction_id
            JOIN transactions AS dest_transactions 
                ON dest_transactions.entity_id = group_transfers.group_id
                AND dest_transactions.xid = group_transfers.destination_transaction_id
            JOIN pockets AS src_pockets 
                ON src_pockets.entity_id = group_transfers.group_id
                AND src_pockets.xid = src_transactions.pocket_id
            JOIN pockets AS dest_pockets 
                ON dest_pockets.entity_id = group_transfers.group_id
                AND dest_pockets.xid = dest_transactions.pocket_id
            JOIN user_contact_details 
                ON user_contact_details.id = group_transfers.admin_id
            WHERE group_transfers.group_id = :group_id
            ORDER BY group_transfers.created_at DESC
            LIMIT :size
        )

        UNION ALL

        (
             SELECT 
                'WithdrawalRequest' AS type,
                debit_requests.xid AS id,
                debit_requests.initiator_id AS actor_id,
                user_contact_details.full_name AS actor_name,
                NULL::INT AS target_id,  
                NULL::TEXT AS target_name,
                debit_requests.pocket_id,
                pockets.name AS pocket_name,
                debit_requests.amount,
                jsonb_build_object(
                    'reason', debit_requests.reason,
                    'recipients', COALESCE(
                        jsonb_agg(jsonb_build_object(
                            'id', withdrawal_recipients.recipient_id,
                            'name', recipient_details.full_name,
                            'amount', withdrawal_recipients.amount
                        )), '[]'::JSONB
                    )
                )::JSONB AS metadata,
                debit_requests.created_at
            FROM debit_requests
            LEFT JOIN withdrawal_recipients 
                ON withdrawal_recipients.group_id = debit_requests.group_id
                AND withdrawal_recipients.request_id = debit_requests.xid
            LEFT JOIN user_contact_details AS recipient_details 
                ON recipient_details.id = withdrawal_recipients.recipient_id
            JOIN user_contact_details 
                ON user_contact_details.id = debit_requests.initiator_id
            LEFT JOIN pockets 
                ON pockets.xid = debit_requests.pocket_id
                AND pockets.entity_id = debit_requests.group_id
            WHERE debit_requests.group_id = :group_id
            AND debit_type = 'Withdrawal'
            GROUP BY 
              debit_requests.xid, 
              debit_requests.initiator_id, 
              user_contact_details.full_name, 
              debit_requests.pocket_id, 
              pockets.name, 
              debit_requests.amount, 
              debit_requests.reason, 
              debit_requests.created_at
            ORDER BY debit_requests.created_at DESC
            LIMIT :size
        )
        
        UNION ALL

        (
          SELECT
            'LoanRequest' AS type,
            debit_requests.xid AS id,
            debit_requests.initiator_id AS actor_id,
            user_contact_details.full_name AS actor_name,
            NULL::INT AS target_id,
            NULL::TEXT AS target_name,
            debit_requests.pocket_id,
            pockets.name AS pocket_name,
            debit_requests.amount,
            jsonb_build_object(
                'reason', debit_requests.reason,
                'status', debit_requests.status
            )::JSONB AS metadata,
            debit_requests.created_at
          FROM debit_requests
          JOIN user_contact_details
             ON user_contact_details.id = debit_requests.initiator_id
          LEFT JOIN pockets
            ON pockets.xid = debit_requests.pocket_id
            AND pockets.entity_id = debit_requests.group_id
          WHERE debit_requests.group_id = :group_id
            AND debit_requests.debit_type = 'Loan'
          ORDER BY debit_requests.created_at DESC
          LIMIT :size 
        )

        UNION ALL

        (
            SELECT 
                'WithdrawalApproval' AS type,
                debit_approvals.request_id AS id,
                debit_approvals.admin_id AS actor_id,
                admin_details.full_name AS actor_name,
                NULL::INT AS target_id,  
                NULL::TEXT AS target_name,
                debit_requests.pocket_id,
                pockets.name AS pocket_name,
                debit_requests.amount,
                jsonb_build_object(
                    'reason', debit_requests.reason,
                    'status', 'Approved'
                )::JSONB AS metadata,
                debit_approvals.created_at
            FROM debit_approvals
            JOIN debit_requests 
                ON debit_requests.xid = debit_approvals.request_id
                AND debit_requests.group_id = debit_approvals.group_id
            JOIN user_contact_details AS admin_details 
                ON admin_details.id = debit_approvals.admin_id
            LEFT JOIN pockets 
                ON pockets.xid = debit_requests.pocket_id
                AND pockets.entity_id = debit_requests.group_id
            WHERE debit_requests.group_id = :group_id
            AND debit_approvals.status = 'Approved'
            ORDER BY debit_approvals.created_at DESC
            LIMIT :size
        )

        UNION ALL

        (
            SELECT 
                'WithdrawalRejection' AS type,
                debit_approvals.request_id AS id,
                debit_approvals.admin_id AS actor_id,
                admin_details.full_name AS actor_name,
                NULL::INT AS target_id,  
                NULL::TEXT AS target_name,
                debit_requests.pocket_id,
                pockets.name AS pocket_name,
                debit_requests.amount,
                jsonb_build_object(
                    'reason', debit_requests.reason,
                    'status', 'Rejected'
                )::JSONB AS metadata,
                debit_approvals.created_at
            FROM debit_approvals
            JOIN debit_requests 
                ON debit_requests.xid = debit_approvals.request_id
                AND debit_requests.group_id = debit_approvals.group_id
            JOIN user_contact_details AS admin_details 
                ON admin_details.id = debit_approvals.admin_id
            LEFT JOIN pockets 
                ON pockets.xid = debit_requests.pocket_id
                AND pockets.entity_id = debit_requests.group_id
            WHERE debit_requests.group_id = :group_id
            AND debit_approvals.status = 'Rejected'
            ORDER BY debit_approvals.created_at DESC
            LIMIT :size
        )
    ) AS activities
    ORDER BY created_at DESC
    LIMIT :size;
`);

const getGroupActivities = (router: Router) => {
  router.get({
    path: '/:user_id/activities',
    summary: 'Get group activities',
    auth: true,
    schema: {
      params: z.object({
        user_id: entityIdParamsSchema
      }),
      query: z.object({
        size: z.number()
      }).partial()
    },
    response: {
      schema: z.array(activitySchema)
    },
    handler: async (req, res) => {
      const groupId = await decodeEntityAndVerifyAccess(req, true);
      const size = req.query.size || 200;

      const activities = await SQL_GET_GROUP_ACTIVITIES({
        group_id: groupId,
        size
      }).many();

      res.json(activities);
    }
  });
};

export default getGroupActivities;