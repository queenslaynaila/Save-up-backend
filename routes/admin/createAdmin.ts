import 'express-async-errors';
import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { CreateAdminSchema, Admin } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';
import { generateToken } from '../../middleware/generatetoken';

const SQL_CREATE_ADMIN = sql<z.infer<typeof CreateAdminSchema>, Admin>(`
    INSERT INTO users (first_name, last_name, phone_number, password, role, created_at, updated_at) 
    VALUES (:first_name, :last_name, :phone_number, :password, :role, NOW(), NOW())
    RETURNING id, first_name, last_name, phone_number, role, created_at, updated_at
`);

export default (router: Router) => {
  router.post<Record<string, never>,Admin,typeof CreateAdminSchema,Record<string, never>,Record<string, never>>(
    '/', 
    async (req, res) => {
      const validationResult = CreateAdminSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw new HttpError(422, 'Invalid phone number or password');
      }
      const { first_name, last_name, phone_number, password, role } = validationResult.data;
      const password_hash = bcrypt.hashSync(password, 10);
      const newUser = await SQL_CREATE_ADMIN({
        first_name,
        last_name,
        phone_number,
        password: password_hash,
        role,
      }).one();
      const token = generateToken(newUser.id, newUser.role, '1h');
      return res.setHeader('X-Auth-Token', token).json(newUser);
    });
};
