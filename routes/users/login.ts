import { Router, Request } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { sql } from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
import { generateToken } from '../../middleware/generatetoken';
// import validateRequest from '../../middleware/validationMiddleware';
import { loginAttemptSchema, userContactDetailsSchema, userSchema } from './schema';

const loggedInUserSchema = userSchema.extend({
  phone_number: userContactDetailsSchema.shape.phone_number,
  full_name: userContactDetailsSchema.shape.full_name
});
export type User = z.infer<typeof loggedInUserSchema>;

const SQL_GET_USER = sql<{ phone_number: string }, User>(`
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
  FROM 
    users
  LEFT JOIN 
    user_contact_details ON users.id = user_contact_details.id
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

const SQL_RECORD_LOGIN = sql<LoginAttempt, Record<string, never>>(`
  INSERT INTO login_attempts (user_id, xid, ip_address, browser_info, success, reason)
  SELECT 
      :user_id, 
      COALESCE(MAX(xid), 0) + 1, 
      :ip_address, 
      :browser_info, 
      :success, 
      :reason
  FROM login_attempts
  WHERE user_id = :id
`);

const SQL_COUNT_LAST_FAILED_ATTEMPTS = sql<{ id: number }, { failed_count: number }>(`
  SELECT COUNT(*) AS failed_count
  FROM (
    SELECT 1
    FROM login_attempts
    WHERE user_id = :id
    AND success = FALSE
    ORDER BY created_at DESC
    LIMIT 3
  ) AS subquery
`);

const recordLoginAttempt = async (
  userId: number,
  ipAddress: string,
  userAgent: string,
  success: boolean,
  reason: string
) => {
  await SQL_RECORD_LOGIN({
    user_id: userId,
    ip_address: ipAddress,
    browser_info: userAgent,
    success,
    reason
  }).exec();
};

const getRequestInfo = (req: Request) => ({
  ipAddress: req.ip || 'unknown',
  userAgent: req.get('User-Agent') || 'unknown'
});

type UserWithoutPin = Omit<User, 'pin'>;

const authSchema = z.object({
  phone_number: userContactDetailsSchema.shape.phone_number,
  pin: userSchema.shape.pin
});

type Authorization = z.infer<typeof authSchema>;

export default (router: Router) => {
  router.post<Record<string, never>, UserWithoutPin, Authorization, Record<string, never>>(
    '/login',
    async (req, res) => {
      const { pin, ...user } = await SQL_GET_USER({
        phone_number: req.body.phone_number
      }).one(new HttpError(401));

      const { failed_count } = await SQL_COUNT_LAST_FAILED_ATTEMPTS({
        id: user.id
      }).one();

      const { ipAddress, userAgent } = getRequestInfo(req);

      if (failed_count >= 3) {
        await recordLoginAttempt(user.id, ipAddress, userAgent, false, 'Locked');
        throw new HttpError(423);
      }

      if (!await bcrypt.compare(req.body.pin, pin)) {
        await recordLoginAttempt(user.id, ipAddress, userAgent, false, 'Incorrect pin');
        const remaining_attempts = 3 - (failed_count + 1);
        throw new HttpError(401, { remaining_attempts });
      }

      await recordLoginAttempt(user.id, ipAddress, userAgent, true, 'Success');
      const accessToken = generateToken(user.id, user.role, '1d');
      const refreshToken = generateToken(user.id, user.role, '7d');
      res
        .setHeader('refresh-token', refreshToken)
        .setHeader('authorization-token', accessToken)
        .json(user);
    }
  );
};