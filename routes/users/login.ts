import { Router } from 'express';
import bcrypt from 'bcrypt';
import { sql } from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
import { generateToken } from '../../middleware/generatetoken';
import { validateRequest } from '../../middleware/validationMiddleware';
import { loginSchema, LoginType,  UserType } from './types';

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
    users.failed_attempts,
    users.is_locked,
    users.created_at
  FROM 
    users
  LEFT JOIN 
    user_contact_details ON users.id = user_contact_details.id
  WHERE user_contact_details.phone_number = :phone_number
`);

const SQL_START_SESSION = sql<{ id: number }, Record<string,never>>(`
  SELECT start_session(:id);
`);

const SQL_INCREMENT_FAILED_ATTEMPTS = sql<{ id: number }, { increment_attempts: number }>(`
  SELECT * FROM increment_attempts(:id)
`);

export default (router: Router) => {
  router.post<Record<string, never>, UserWithoutPin, LoginType, Record<string, never>>(
    '/login',
    validateRequest(loginSchema),
    async (req, res) => {
      const { pin, ...user } = await SQL_GET_USER({ phone_number: req.body.phone_number }).one(
        new HttpError(400, 'User not found. Register')
      );

      if (user.is_locked) {
        throw new HttpError(423, 'Account is locked.');
      }

      if (!await bcrypt.compare(req.body.pin, pin)) {
        const { increment_attempts: attempts_left } = await SQL_INCREMENT_FAILED_ATTEMPTS({ id: user.id }).one();
        if (attempts_left <= 0) {
          throw new HttpError(423, `Account is locked. You have exhausted the maximum number of login attempts.`);
        }
        throw new HttpError(400, `Invalid phone number or password combination. You have ${attempts_left} attempts left.`);
      }

      await SQL_START_SESSION({ id: user.id }).exec();
      const accessToken = generateToken(user.id, user.role, '1d');
      const refreshToken = generateToken(user.id, user.role, '7d');
      res
        .setHeader('refresh-token', refreshToken)
        .setHeader('authorization-token', accessToken)
        .json(user);
    }
  );
};
