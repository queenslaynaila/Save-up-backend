import { Router } from 'express';
import bcrypt from 'bcrypt';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';
import { CreateUserSchema, UserSchema } from '../../types';
import  { validateRequest } from '../../middleware/validationMiddleware';

interface CreateUserSchema {
  first_name: string;
  last_name: string;
  password: string;
  phone_number: string;
}

interface CreateUserWithIdSchema extends Omit<CreateUserSchema, 'phone_number'> {
  id: number;
}

const SQL_CREATE_USER_PHONE = sql<Pick<CreateUserSchema, 'phone_number'>, { id: number }>(`
  INSERT INTO users_phone (phone_number)
  VALUES (:phone_number)
  RETURNING id
`);

const SQL_CREATE_USER = sql<CreateUserWithIdSchema, UserSchema>(`
  INSERT INTO users (id, first_name, last_name, password, role)
  VALUES (:id, :first_name, :last_name, :password, 'Admin')
  RETURNING id, first_name, last_name, role, created_at
`);

export default (router: Router) => {
  router.post<Record<string, never>, UserSchema, CreateUserSchema, Record<string, never>, Record<string, never>>(
    '/',
    validateRequest(CreateUserSchema),
    async (req, res) => {
      const { first_name, last_name, password, phone_number } = req.body;
      const user = await SQL_CREATE_USER_PHONE({ phone_number }).one(new HttpError(400, 'Account with this Phone number already exists'));
      const passwordHash = bcrypt.hashSync(password, 10);
      const newUser = await SQL_CREATE_USER({
        id: user.id,
        first_name,
        last_name,
        password: passwordHash,
      }).one();
      res.json(newUser);
    });
};
