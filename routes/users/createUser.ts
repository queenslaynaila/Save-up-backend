import 'express-async-errors';
import { Router } from 'express';
import bcrypt from 'bcrypt';
import { CreateUserSchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/auth';
import { UserRole } from '../../types';
import pool from '../../db';
import { generateToken } from '../../middleware/generatetoken';

export default (router: Router) => {
  router.post(
    '/',
    authMiddleware(),
    async (req, res) => {
      const validationResult = CreateUserSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw new HttpError(422, 'Invalid phone number or password');
      }
      const { first_name, last_name, phone_number, password } = validationResult.data;
      const password_hash = bcrypt.hashSync(password, 10);
      const userQuery = `
          INSERT INTO users (first_name, last_name, phone_number, password, created_at, updated_at) 
          VALUES ($1, $2, $3, $4, NOW(), NOW())
          RETURNING *`;
      const userValues = [first_name, last_name, phone_number, password_hash];
      console.log('before query');
      const userResult = await pool.query(userQuery, userValues);
      if (userResult.rows.length === 0) {
        console.error('Error: User not inserted');
        throw new HttpError(
          400,
          'An account with the provided email or phone number already exists'
        );
      }
      console.log('after query');
      const newUser = userResult.rows[0];

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
    }
  );
};
