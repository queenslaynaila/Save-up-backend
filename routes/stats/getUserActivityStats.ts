import Router from '../../core/router';
import { sql } from '../../db';
import { z } from 'zod';
import { UserRole } from '../users/schema';
import { statsQuerySchema } from './getDepositStats';

const SQL_GET_AGGREGATED_REGISTRATION = sql<
{
  start_date?: string;
  end_date?: string;
  country?: string;
},
{
  total_registrations: number;
  total_succesful_logins: number;
  total_failed_logins: number;
  locked_accounts: number;
  suspended_accounts: number;
  active_accounts: number;
  inactive_accounts: number;
  dormant_accounts: number;
}
>(`
  SELECT
    COUNT(DISTINCT users.id) FILTER (
        WHERE (:start_date::date IS NULL OR users.created_at >= :start_date::date)
          AND (:end_date::date IS NULL OR users.created_at <= :end_date::date)
          AND (:country::text IS NULL OR users.country = :country::text)
    ) AS total_registrations,

    COUNT(*) FILTER (
        WHERE login_attempts.success = TRUE
          AND (:start_date::date IS NULL OR login_attempts.created_at >= :start_date::date)
          AND (:end_date::date IS NULL OR login_attempts.created_at <= :end_date::date)
          AND (:country::text IS NULL OR users.country = :country::text)
    ) AS total_succesful_logins,

    COUNT(*) FILTER (
        WHERE login_attempts.success = FALSE
          AND (:start_date::date IS NULL OR login_attempts.created_at >= :start_date::date)
          AND (:end_date::date IS NULL OR login_attempts.created_at <= :end_date::date)
          AND (:country::text IS NULL OR users.country = :country::text)
    ) AS total_failed_logins,

    COUNT(DISTINCT users.id) FILTER (
        WHERE users.id IN (
            SELECT login_attempts.user_id
            FROM login_attempts
            WHERE login_attempts.xid = (
                SELECT MAX(login_attempts.xid)
                FROM login_attempts
                WHERE login_attempts.user_id = users.id
            )
            AND login_attempts.success = FALSE
            AND login_attempts.reason = 'Locked'
            AND NOT EXISTS (
                SELECT 1
                FROM account_unlocks
                WHERE account_unlocks.user_id = users.id
                  AND account_unlocks.locked_attempt_id = login_attempts.xid
            )
        )
        AND (:country::text IS NULL OR users.country = :country::text)
    ) AS locked_accounts,

    COUNT(DISTINCT users.id) FILTER (
        WHERE users.status = 'Suspended'
          AND (:end_date::date IS NULL OR users.created_at <= :end_date::date)
          AND (:country::text IS NULL OR users.country = :country::text)
    ) AS suspended_accounts,

    COUNT(DISTINCT users.id) FILTER (
        WHERE EXISTS (
            SELECT 1
            FROM transactions
            WHERE transactions.entity_id = users.id
              AND transactions.created_at >= NOW() - INTERVAL '30 days'
        )
        AND (:country::text IS NULL OR users.country = :country::text)
    ) AS active_accounts,

    COUNT(DISTINCT users.id) FILTER (
        WHERE EXISTS (
            SELECT 1
            FROM transactions
            WHERE transactions.entity_id = users.id
              AND transactions.created_at >= NOW() - INTERVAL '60 days'
              AND transactions.created_at < NOW() - INTERVAL '30 days'
        )
        AND (:country::text IS NULL OR users.country = :country::text)
    ) AS inactive_accounts,

    COUNT(DISTINCT users.id) FILTER (
        WHERE NOT EXISTS (
            SELECT 1
            FROM transactions
            WHERE transactions.entity_id = users.id
              AND transactions.created_at >= NOW() - INTERVAL '90 days'
        )
        AND (:country::text IS NULL OR users.country = :country::text)
    ) AS dormant_accounts

  FROM users
  LEFT JOIN login_attempts
    ON login_attempts.user_id = users.id;
`);

const getUserActivityStats = (router: Router) => {
  router.get({
    path: '/stats/auth-metrics',
    summary: 'Get aggregated user authentication metrics',
    description: 'Returns aggregated user statistics within a given date range, '
            + 'including total registrations, total login attempts, failed logins, '
            + 'and  locked accounts. ',
    auth: [UserRole.enum.Admin],
    schema: {
      query: statsQuerySchema.pick({
        start_date: true,
        end_date: true,
      }).extend({
        country: z.string()
      }).partial()
    },
    response: {
      statusCode: 200,
      schema: z.object({
        total_registrations: z.number().int(),
        total_succesful_logins: z.number().int(),
        total_failed_logins: z.number().int(),
        locked_accounts: z.number().int(),
        suspended_accounts: z.number().int(),
        active_accounts: z.number().int(),
        inactive_accounts: z.number().int(),
        dormant_accounts: z.number().int()
      })
    },
    handler: async (req, res) => {
      const { start_date, end_date, country } = req.query;
      const results = await SQL_GET_AGGREGATED_REGISTRATION({
        country,
        start_date,
        end_date
      }).one()
      res.json(results);
    }
  });
};

export default getUserActivityStats;