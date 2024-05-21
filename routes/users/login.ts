import { Router } from 'express';
import bcrypt from 'bcrypt';
import { sql } from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
import { generateToken } from '../../middleware/generatetoken';
import { validateRequest } from '../../middleware/validationMiddleware';
import { updateUserPhoneSchema, UpdatePhoneInterface, ExtendedUserInterface } from './types';

type UserWithoutPin = Omit<ExtendedUserInterface, 'pin'>;

const SQL_GET_USER = sql<{  phone_number: string }, ExtendedUserInterface>(`
  SELECT 
    users.id, 
    users.full_name, 
    users.role, 
    users.gender, 
    users.pin,
    user_contact_details.id_type, 
    user_contact_details.id_number, 
    user_contact_details.phone_number, 
    users.created_at
  FROM 
    users
  LEFT JOIN 
    user_contact_details ON users.id = user_contact_details.id
  WHERE user_contact_details.phone_number = :phone_number
`);

export default (router: Router) => {
  router.post<Record<string,never>, UserWithoutPin, UpdatePhoneInterface, Record<string,never>>(
    '/login',
    validateRequest(updateUserPhoneSchema),
    async (req, res) => {
      const { phone_number , pin } = req.body;
      const user = await SQL_GET_USER({ phone_number }).one(
        new HttpError(400, 'User not found. Register')
      );
      const isPasswordCorrect = await bcrypt.compare(pin, user.pin);
      if (!isPasswordCorrect) {
        throw new HttpError(400, 'Invalid phone number or password combination');
      }
      const userResult = {
        id: user.id,
        full_name: user.full_name,
        gender: user.gender,
        role: user.role,
        id_type:user.id_type,
        id_number: user.id_number,
        phone_number: user.phone_number,
        created_at: user.created_at,
      };
      const accessToken = generateToken(user.id, user.role, '1d');
      const refreshToken = generateToken(user.id, user.role, '7d');
      res
        .setHeader('refresh-token', refreshToken)
        .setHeader('authorization-token', accessToken)
        .json(userResult);
    }
  );
};