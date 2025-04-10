import { Request } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { sql } from '../../db';
import HttpError from '../../httpError';
import {
  userSchema,
  loginAttemptSchema,
  userContactDetailsSchema
} from '../users/schema';
import Router from '../../router';
import { generateToken } from '../../utils';

const authenticatedUserSchema = userSchema.pick({
  id: true,
  id_type: true,
  id_number: true,
  role: true,
  gender: true,
  pin: true,
  created_at: true
}).extend({
  full_name: userContactDetailsSchema.shape.full_name,
  phone_number: userContactDetailsSchema.shape.phone_number
});

export type AuthenticatedUser = z.infer<typeof authenticatedUserSchema>;

export const publicUserSchema = authenticatedUserSchema.pick({
  id: true,
  id_type: true,
  id_number: true,
  role: true,
  gender: true,
  full_name:true,
  phone_number:true,
  created_at: true
});
export type UserWithPublicAttributes = z.infer<typeof publicUserSchema>;

const SQL_GET_USER = sql<{ phone_number: string }, AuthenticatedUser>(`
  SELECT 
    users.id, 
    users.id_type, 
    users.id_number,
    user_contact_details.phone_number, 
    user_contact_details.full_name, 
    users.role, 
    users.gender, 
    users.pin,
    users.created_at
  FROM users
  LEFT JOIN user_contact_details 
    ON users.id = user_contact_details.id
  WHERE user_contact_details.phone_number = :phone_number
`);

const loginSchema = loginAttemptSchema.pick({
  user_id: true,
  ip_address: true,
  browser_info: true,
  success: true,
  reason: true
});
type LoginAttempt = z.infer<typeof loginSchema>;

const SQL_RECORD_LOGIN_ATTEMPT = sql<LoginAttempt, Record<string, never>>(`
  INSERT INTO login_attempts (
    user_id, 
    xid, 
    ip_address, 
    browser_info, 
    success, 
    reason
  )
  SELECT 
    :user_id,
    COALESCE(MAX(xid), 0) + 1, 
    :ip_address, 
    :browser_info, 
    :success, 
    :reason
  FROM login_attempts
  WHERE user_id = :user_id
`);


export async function recordLoginAttempt(
  userId: number,
  ipAddress: string,
  userAgent: string,
  success: boolean,
  reason: string
) {
  await SQL_RECORD_LOGIN_ATTEMPT({
    user_id: userId,
    ip_address: ipAddress,
    browser_info: userAgent,
    success,
    reason
  }).exec();
}

export function getClientInfo(req: Request) {
  return {
    ipAddress: req.ip || 'unknown',
    userAgent: req.get('User-Agent') || 'unknown'
  };
}

const SQL_GET_LOGIN_STATUS = sql<{ user_id: number }, {
  is_locked: boolean,
  is_unlocked: boolean,
  failed_attempts: number
}>(`
  SELECT 
    EXISTS (
      SELECT 1
      FROM login_attempts
      WHERE user_id = :user_id
        AND xid = (
        SELECT MAX(xid)
        FROM login_attempts
        WHERE user_id = :user_id
      )
        AND success = false
        AND reason = 'Locked'
    ) AS is_locked,
    
    EXISTS (
      SELECT 1
      FROM account_unlocks
      WHERE user_id = :user_id
      AND locked_attempt_id = (
        SELECT MAX(xid) 
        FROM login_attempts 
        WHERE user_id = :user_id 
          AND success = false
          AND reason = 'Locked'
      )
    ) AS is_unlocked,

    COALESCE((
        SELECT COUNT(*)
        FROM login_attempts
        WHERE login_attempts.user_id = :user_id
            AND login_attempts.success = false
            AND login_attempts.xid > GREATEST(
                COALESCE((
                    SELECT MAX(login_attempts.xid)
                    FROM login_attempts
                    WHERE login_attempts.user_id = :user_id
                    AND login_attempts.success = true
                ), 0),
                COALESCE((
                    SELECT MAX(account_unlocks.locked_attempt_id)
                    FROM account_unlocks
                    WHERE account_unlocks.user_id = :user_id
                ), 0)
            )
   ), 0) AS failed_attempts
`);

const login = (router: Router) => {
  router.post({
    path: '/login',
    summary: 'Login',
    schema: {
      body: z.object({
        phone_number: userContactDetailsSchema.shape.phone_number,
        pin: userSchema.shape.pin
      })
    },
    response: {
      statusCode: 200,
      schema:  publicUserSchema.pick({
        id:true,
        role:true,
        gender:true,
        full_name:true,
        phone_number:true,
        created_at:true
      })
    },
    handler: async (req, res) => {
      const { pin, ...user } = await SQL_GET_USER({
        phone_number: req.body.phone_number
      }).one(new HttpError(401));

      const { ipAddress, userAgent } = getClientInfo(req);

      const { is_locked, is_unlocked, failed_attempts } = await SQL_GET_LOGIN_STATUS({
        user_id: user.id
      }).one();

      const remainingAttempts = is_locked && is_unlocked
          ? 4
          : 4 - failed_attempts;

      if (remainingAttempts === 0) {
          await recordLoginAttempt(user.id, ipAddress, userAgent, false, 'Locked');
          throw new HttpError(423);
      }

      if (!await bcrypt.compare(req.body.pin, pin)) {
        await recordLoginAttempt(user.id, ipAddress, userAgent, false, 'Incorrect pin');
        throw new HttpError(401, { remaining_attempts: remainingAttempts-1 });
      }

      await recordLoginAttempt(
        user.id,
        ipAddress,
        userAgent,
        true,
        'Returning'
      );

      res
        .setHeader('Authorization', generateToken(user.id, '7d', user.role))
        .json(user);
    }
  });
};

export default login;