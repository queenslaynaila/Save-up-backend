import { Router } from 'express';
import bcrypt from 'bcrypt';
import { sql } from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
import { generateToken } from '../../middleware/generatetoken';
import { validateRequest } from '../../middleware/validationMiddleware';
import { UpdateUserPhoneSchema,GetUserInterface,UpdatePhoneInterface } from '../../types';

type ExtendedUserInterface = GetUserInterface & { pin: string };

const SQL_GET_USER_ENTITY_ID = sql<{ phone_number: string }, { id: number }>(`
  SELECT id
  FROM user_contacts
  WHERE phone_number = :phone_number
`);

const SQL_GET_USER = sql<{ id: number },ExtendedUserInterface>(`
  SELECT *
  FROM users
  WHERE id = :id
`);

export default (router: Router) => {
  router.post<Record<string, never>, GetUserInterface , UpdatePhoneInterface , Record<string, never>>(
    '/signin',
    validateRequest(UpdateUserPhoneSchema),
    async (req, res) => {
      const { phone_number , pin } = req.body;
      const entity_id = await SQL_GET_USER_ENTITY_ID({ phone_number }).one(
        new HttpError(404, 'Not found')
      );
      const user = await SQL_GET_USER({ id: entity_id.id }).one();
      const isPasswordCorrect = await bcrypt.compare(pin, user.pin);
      if (!isPasswordCorrect) {
        throw new HttpError(400, 'Invalid phone number or password combination');
      }
      const userResult = {
        id: user.id,
        full_name: user.full_name,
        gender: user.gender,
        role: user.role,
        created_at: user.created_at,
      };
      const accessToken = generateToken(user.id, user.role, '1d');
      const refreshToken = generateToken(user.id, user.role, '7d');
      res
        .setHeader('X-Refresh-Token', refreshToken)
        .setHeader('X-Auth-Token', accessToken)
        .json(userResult);
    }
  );
};
