import { Router } from 'express';
import bcrypt from 'bcrypt';
import { sql } from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
import { generateToken } from '../../middleware/generatetoken';
import { validateRequest } from '../../middleware/validationMiddleware';
import { loginSchema, LoginType,  UserType, LoginAttempt } from './types';

type UserWithoutPin = Omit<UserType, 'pin'>;

const SQL_GET_USER = sql<{ phone_number: string }, UserType>(`
  SELECT 
    users.id, 
    user_contact_details.id_type, 
    user_contact_details.id_number, 
    user_contact_details.phone_number, 
    users.full_name, 
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

const SQL_RECORD_LOGIN = sql<LoginAttempt, Record<string, never>>(`
  INSERT INTO login_attempts (user_id, xid, ip_address, browser_info, success, reason)
  SELECT 
      :id, 
      COALESCE(MAX(xid), 0) + 1, 
      :ip_address, 
      :user_agent, 
      :success, 
      :reason
  FROM login_attempts
  WHERE user_id = :id
`);

const SQL_COUNT_LAST_FAILED_ATTEMPTS = sql<{id: number},{failed_count: number}>(`
  SELECT COUNT(*) AS failed_count
  FROM (
    SELECT 1
    FROM login_attempts
    WHERE user_id = :id
    AND success = FALSE
    ORDER BY created_at DESC
    LIMIT 3
  );
`);

export default (router: Router) => {
  router.post<Record<string, never>, UserWithoutPin, LoginType, Record<string, never>>(
    '/login',
    validateRequest(loginSchema),
    async (req, res) => {
      const { pin, ...user } = await SQL_GET_USER({ 
        phone_number: req.body.phone_number 
      }).one(new HttpError(401));

      const { failed_count } = await SQL_COUNT_LAST_FAILED_ATTEMPTS({ id: user.id }).one();  
      
      if (failed_count >= 3) {
        await SQL_RECORD_LOGIN({
          id:user.id, 
          ip_address: req.ip || 'unknown',
          user_agent: req.get('User-Agent') || 'unknown',
          success: false, 
          reason: 'Locked'
        }).exec();
        throw new HttpError(423);
      }

      if (!await bcrypt.compare(req.body.pin, pin)) {
        await SQL_RECORD_LOGIN({
          id:user.id, 
          ip_address: req.ip || 'unknown',
          user_agent: req.get('User-Agent') || 'unknown',
          success: false, 
          reason: 'Incorrect pin'
        }).exec();
        const remaining_attempts = 3 - (failed_count + 1); 
        throw new HttpError(
          401, 
          { remaining_attempts }
        );
      }

      await SQL_RECORD_LOGIN({
        id:user.id, 
        ip_address: req.ip || 'unknown',
        user_agent: req.get('User-Agent') || 'unknown',
        success: true, 
        reason: 'Success'
      }).exec();
      const accessToken = generateToken(user.id, user.role, '1d');
      const refreshToken = generateToken(user.id, user.role, '7d');
      res
        .setHeader('refresh-token', refreshToken)
        .setHeader('authorization-token', accessToken)
        .json(user);
    }
  );
};