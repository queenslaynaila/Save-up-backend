import { Router } from 'express';
import { generateToken } from '../../middleware/generatetoken';
import { UserLoginSchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import pool from '../../db';
import bcrypt from 'bcrypt';

export default (router: Router) => {
  router.post('/signin', async (req, res) => {
    const validationResult = UserLoginSchema.safeParse(req.body);
   
    if (!validationResult.success) {
      throw new HttpError(422, 'Invalid phone number or password');
    }
    const { password, phone_number } = req.body;
    const params = [phone_number];
    const query = 'SELECT * FROM users WHERE phone_number = $1';

    const result = await pool.query(query, params);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new HttpError(400, 'Invalid phone number or password combination');
    }

    const token = generateToken(user.id,user.role);
    res.setHeader('X-Auth-Token', token).json(user);
  });
};
