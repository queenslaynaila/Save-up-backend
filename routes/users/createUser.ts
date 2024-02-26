import { Router } from 'express';
import bcrypt from 'bcrypt';
import { CreateUserSchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';
import { generateToken } from '../../middleware/generatetoken';
import { UserSchema } from './index';

export default (router: Router) => {
  router.post('/', async (req, res) => {
    const validationResult = CreateUserSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new HttpError(422, 'Invalid phone number or password');
    }
    const { first_name, last_name, phone_number, password } = validationResult.data;
    const password_hash = bcrypt.hashSync(password, 10);

    const query = `INSERT INTO users (first_name, last_name, phone_number, password, created_at, updated_at)
     VALUES (:first_name, :last_name, :phone_number, :password, NOW(), NOW())
    RETURNING *`;

    const SQL_CREATE_USER = sql<
    { first_name: string; last_name: string; phone_number: string; password: string },
    UserSchema
    >(query);

    const newUser = await SQL_CREATE_USER({
      first_name,
      last_name,
      phone_number,
      password: password_hash,
    })
      .one()
      .catch(() => {
        throw new HttpError(400, 'An account with the provided phone number already exists');
      });

    const userDataToSend = {
      id: newUser.id,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      phone_number: newUser.phone_number,
      role: newUser.role,
      created_at: newUser.created_at,
      updated_at: newUser.updated_at,
    };
    const token = generateToken(newUser.id, newUser.role);
    res.setHeader('X-Auth-Token', token).json(userDataToSend);
  });
};
