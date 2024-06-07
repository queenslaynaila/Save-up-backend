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
    users.full_name, 
    users.role, 
    users.gender, 
    users.pin,
    user_contact_details.phone_number, 
    users.created_at
  FROM 
    users
  LEFT JOIN 
    user_contact_details ON users.id = user_contact_details.id
  WHERE user_contact_details.phone_number = :phone_number
`);

export default (router: Router) => {
  router.post<Record<string,never>, UserWithoutPin, LoginType, Record<string,never>>(
    '/login',
    validateRequest(loginSchema),
    async (req, res) => {
      const { pin, ...user } = await SQL_GET_USER({ phone_number: req.body.phone_number }).one(
        new HttpError(400, 'User not found. Register')
      );      
      if (!await bcrypt.compare(req.body.pin, pin)) {
        throw new HttpError(400, 'Invalid phone number or password combination');
      }
      const accessToken = generateToken(user.id, user.role, '1d');
      const refreshToken = generateToken(user.id, user.role, '7d');
      res
        .setHeader('refresh-token', refreshToken)
        .setHeader('authorization-token', accessToken)
        .json(user);
    }
  );
};