import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import {UserRole} from "../users/schema";
import {statsQuerySchema} from "./getDepositStats";


const SQL_GET_AGGREGATED_REGISTRATION = sql<
    {
        start_date?: string;
        end_date?: string;
        user_id?: number;
    },
    {
        total_registrations: number;
        total_logins: number;
        total_failed_logins: number;
        locked_accounts: number;
    }
>(`
  WITH filtered_users AS (
    SELECT id
    FROM users
    WHERE (:user_id IS NULL OR id = :user_id)
      AND (:start_date::DATE IS NULL OR DATE(created_at) >= :start_date::DATE)
      AND (:end_date::DATE IS NULL OR DATE(created_at) <= :end_date::DATE)
  ),
  filtered_logins AS (
    SELECT *
    FROM login_attempts
    WHERE (:start_date::DATE IS NULL OR DATE(created_at) >= :start_date::DATE)
      AND (:end_date::DATE IS NULL OR DATE(created_at) <= :end_date::DATE)
      AND (:user_id::INT IS NULL OR user_id = :user_id)
  ),
  locked_users AS (
    SELECT user_id
    FROM filtered_logins f1
    WHERE success = false
      AND NOT EXISTS (
        SELECT 1 FROM filtered_logins f2
        WHERE f2.user_id = f1.user_id 
          AND f2.success = true 
          AND f2.created_at > f1.created_at
      )
  )

  SELECT
    (SELECT COUNT(*) FROM filtered_users) AS total_registrations,
    (SELECT COUNT(*) FROM filtered_logins) AS total_logins,
    (SELECT COUNT(*) FROM filtered_logins WHERE success = false) AS total_failed_logins,
    (SELECT COUNT(*) FROM locked_users) AS locked_accounts
`);


const getUserActivityStats = (router: Router) => {
    router.get({
        path: '/stats/auth-metrics',
        summary: 'Get user activity stats',
        description: 'Returns aggregated user statistics within a given date range, ' +
            'including total registrations, total login attempts, failed logins, ' +
            'and  locked accounts. ',
        auth:[UserRole.enum.Admin, UserRole.enum.Moderator],
        schema: {
            query: statsQuerySchema.pick({
                start_date: true,
                end_date: true
            }).extend({
                user_id: z.number().int().min(1).optional()
            })
        },
        response: {
            statusCode:200,
            schema: z.object({
                total_registrations: z.number().int(),
                total_logins: z.number().int(),
                total_failed_logins: z.number().int(),
                locked_accounts: z.number().int(),
            })
        },
        handler: async (req, res) => {
            const { user_id,  start_date, end_date } = req.query
            const results = await SQL_GET_AGGREGATED_REGISTRATION({
                user_id,
                start_date,
                end_date
            }).one();
            res.json(results);
        }
    });
};

export default getUserActivityStats;