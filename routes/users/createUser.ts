import { Router } from 'express';
import bcrypt from 'bcrypt';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';
import { generateToken } from '../../middleware/generatetoken';
import { CreateUserSchema, UserSchema } from '../../types';

interface CreateUserSchema {
  first_name: string;
  last_name: string;
  phone_number: string;
  password: string;
}

const SQL_CREATE_USER = sql<CreateUserSchema, UserSchema>(`
  INSERT INTO users (first_name, last_name, phone_number, password)
  VALUES (:first_name, :last_name, :phone_number, :password
  RETURNING id, first_name, last_name, phone_number,role, created_at
`);

export default (router: Router) => {
  router.post<Record<string, never>,UserSchema,CreateUserSchema,Record<string, never>,Record<string, never>>(
    '/',
    async (req, res) => {
      const validationResult = CreateUserSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw new HttpError(422, 'Invalid phone number or password');
      }

      const { first_name, last_name, phone_number, password } = validationResult.data;
      const passwordHash = bcrypt.hashSync(password, 10);
      const newUser = await SQL_CREATE_USER({
        first_name,
        last_name,
        phone_number,
        password: passwordHash,
      })
        .one()
        .catch(() => {
          throw new HttpError(400, 'An account with the provided phone number already exists');
        });

      const token = generateToken(newUser.id, newUser.role, '1h');
      const refreshToken = generateToken(newUser.id, newUser.role, '1h');
      res.setHeader('X-Refresh-Token', refreshToken).setHeader('X-Auth-Token', token).json(newUser);
    });
};
