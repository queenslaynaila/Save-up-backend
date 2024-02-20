import { Router } from 'express';
import { generateToken } from '../../middleware/generatetoken';
import authMiddleware from '../../middleware/auth';
import { UserRole } from '../../types';
import { UserLoginSchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import pool from '../../db';
import bcrypt from 'bcrypt';

export default (router: Router) => {
  router.post(
    '/signin',
    authMiddleware({ roles: [UserRole.ADMIN, UserRole.USER] }),
    async (req, res) => {
      const validationResult = UserLoginSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw new HttpError(422, 'Invalid phone number or password');
      }
      const { password, phone_no } = req.body;
      const params = [phone_no];
      const query = 'SELECT * FROM users WHERE phone_no = $1';

      const result = await pool.query(query, params);
      const user = result.rows[0];

      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        throw new HttpError(400, 'Invalid phone number or password combination');
      }

      const token = generateToken(user.id);
      res.cookie('token', token, { httpOnly: true, secure: true }).json(user);
    }
  );
};
