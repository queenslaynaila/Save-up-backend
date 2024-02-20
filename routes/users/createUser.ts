import { Router } from 'express';
import bcrypt from 'bcrypt';
import authMiddleware from '../../middleware/auth';
import { CreateUserSchema, UserRole } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import pool from '../../db';
import { generateToken } from '../../middleware/generatetoken';

export default (router: Router) => {
  router.post('/', authMiddleware({ roles: [UserRole.ADMIN, UserRole.USER] }), async (req, res) => {
    const validationResult = CreateUserSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new HttpError(422, 'Invalid phone number or password');
    }
    const { first_name, last_name, phone_no, password } = validationResult.data;
    const password_hash = bcrypt.hashSync(password, 10);
    const userQuery = `
          INSERT INTO users (first_name, last_name, phone_no, password_hash, created_at, updated_at) 
          VALUES ($1, $2, $3, $4, NOW(), NOW())
          RETURNING *`;
    const userValues = [first_name, last_name, phone_no, password_hash];

    const userResult = await pool.query(userQuery, userValues);
    const newUser = userResult.rows[0];

    const userDataToSend = {
      id: newUser.id,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      email: newUser.email,
      phone_no: newUser.phone_no,
      created_at: newUser.created_at,
      updated_at: newUser.updated_at,
      total_targeted_amount: newUser.total_targeted_amount,
      total_contributions_amount: newUser.total_contributions_amount,
      total_expenses_amount: newUser.total_expenses_amount,
    };

    const token = generateToken(newUser.id);
    res.setHeader('X-Auth-Token', token).json(userDataToSend);
  });
};
