import { Request } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { sql } from '../../db';
import HttpError from '../../httpError';
import { 
  userSchema, 
  loginAttemptSchema, 
  userContactDetailsSchema, 
  Role 
} from '../users/schema';
import Router from '../../router';
import Config from '../../config';
import jwt, { Secret } from 'jsonwebtoken';
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
export const publicUserSchema = authenticatedUserSchema.omit({ pin: true });
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

const loginOutcomeSchema = loginSchema.pick({
  success: true,
  reason: true
});

type LoginOutcome = z.infer<typeof loginOutcomeSchema>;

const SQL_GET_LAST_THREE_LOGIN_ATTEMPTS = sql<{ id: number }, LoginOutcome>(`
  SELECT success, reason
  FROM login_attempts
  WHERE user_id = :id
  ORDER BY xid DESC
  LIMIT 3
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

function calculateLoginAttemptsLeft(lastThreeAttempts: LoginOutcome[]) {
  if (lastThreeAttempts.length === 0 || lastThreeAttempts[0].success) {
    return 4;
  }

  if (lastThreeAttempts[0].reason === 'Locked') {
    throw new HttpError(423);
  }

  const failedAttempts = lastThreeAttempts.reduce(
    (count, attempt) => count + (!attempt.success ? 1 : 0),
    0
  );

  return 4 - failedAttempts;
}

const authSchema = z.object({
  phone_number: userContactDetailsSchema.shape.phone_number,
  pin: userSchema.shape.pin
});

const login = (router: Router) => {
  router.route({
    method: 'post',
    path: '/login',
    summary: 'Let an existing user login',
    request: {
      body: authSchema
    },
    response: {
      201: {
        schema: publicUserSchema.omit({
          id_type: true,
          id_number: true
        }),
        headers: z.object({
          Authorization: z.string()
        })
      },
      401: {
        schema: z.object({
          remaining_attempts: z.number().min(0).max(3)
        })
      }
    },
    handler: async (req, res) => {
      const { pin, ...user } = await SQL_GET_USER({
        phone_number: req.body.phone_number
      }).one(new HttpError(401));

      const lastThreeAttempts = await SQL_GET_LAST_THREE_LOGIN_ATTEMPTS({
        id: user.id
      }).many();

      const remainingAttempts = calculateLoginAttemptsLeft(lastThreeAttempts);
      const { ipAddress, userAgent } = getClientInfo(req);

      if (remainingAttempts === 0) {
        await recordLoginAttempt(
          user.id, 
          ipAddress, 
          userAgent, 
          false, 
          'Locked'
        );
        throw new HttpError(423);
      }

      if (!await bcrypt.compare(req.body.pin, pin)) {
        await recordLoginAttempt(
          user.id, 
          ipAddress, 
          userAgent, 
          false, 
          'Incorrect pin'
        );
        throw new HttpError(401, { remaining_attempts: remainingAttempts - 1 });
      }

      await recordLoginAttempt(
        user.id, 
        ipAddress, 
        userAgent, 
        true, 
        'Returning'
      );

      const accessToken = generateToken(user.id, user.role, '7d');
      
      res
        .setHeader('Authorization', accessToken)
        .json(user);
    }
  });
};

export default login;