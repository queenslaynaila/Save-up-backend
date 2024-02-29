import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';
import { generateToken } from '../../middleware/generatetoken';
import { CreateUserSchema, UserSchema } from '../../types';

const SQL_CREATE_USER = sql<z.infer<typeof CreateUserSchema>, UserSchema>(`
  INSERT INTO users (first_name, last_name, phone_number, password, created_at, updated_at)
  VALUES (:first_name, :last_name, :phone_number, :password, NOW(), NOW())
  RETURNING id, first_name, last_name, phone_number, created_at, updated_at`);

export default (router: Router) => {
  router.post('/', async (req, res) => {
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
      // .catch(() => {
      //   throw new HttpError(400, 'An account with the provided phone number already exists');
      // });

    const token = generateToken(newUser.id, newUser.role);
    res.setHeader('X-Auth-Token', token).json(newUser);
  });
};
