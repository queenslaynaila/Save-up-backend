import { Router } from 'express';
import bcrypt from 'bcrypt';
import { HttpError } from '../../middleware/errorMiddleware';
import { generateToken } from '../../middleware/generatetoken';
import { sql } from '../../db';
import { UserLoginSchema } from '../../types';
import { UserSchema } from './index';

interface ExtendedUserSchema extends UserSchema {
  password: string;
}

const SQL_GET_USER = sql<{ phone_number: string }, ExtendedUserSchema>(`
  SELECT *
  FROM users
  WHERE phone_number = :phone_number
`);

export default (router: Router) => {
  router.post('/signin', async (req, res) => {
    const validationResult = UserLoginSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new HttpError(422, 'Invalid phone number or password');
    }

    const { password, phone_number } = validationResult.data;
    const userResult = await SQL_GET_USER({ phone_number }).one(
      new HttpError(400, 'User not found')
    );

    const isPasswordCorrect = await bcrypt.compare(password, userResult.password);
    if (!isPasswordCorrect) {
      throw new HttpError(400, 'Invalid phone number or password combination');
    }
    const userDataToSend = {
      id: userResult.id,
      first_name: userResult.first_name,
      last_name: userResult.last_name,
      phone_number: userResult.phone_number,
      role: userResult.role,
      created_at: userResult.created_at,
      updated_at: userResult.updated_at,
    };
    const accessToken = generateToken(userResult.id, userResult.role,'1d');
    const refreshToken = generateToken(userResult.id, userResult.role, '7d');

    res.setHeader('X-Refresh-Token', refreshToken);
    res.setHeader('X-Auth-Token', accessToken).json(userDataToSend);
    
  });
};
