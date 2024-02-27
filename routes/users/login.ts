import { Router } from 'express';
import { generateToken } from '../../middleware/generatetoken';
import { UserLoginSchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';
import { UserSchema } from './index';
import bcrypt from 'bcrypt';
interface ExtendedUserSchema extends UserSchema {
  password: string;
}
export default (router: Router) => {
  router.post('/signin', async (req, res) => {
    const validationResult = UserLoginSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new HttpError(422, 'Invalid phone number or password');
    }

    const { password, phone_number } = validationResult.data;

    const query = `SELECT *
                   FROM users
                   WHERE phone_number = :phone_number`;

    const SQL_GET_USER = sql<{ phone_number: string }, ExtendedUserSchema>(query);
    const userResult = await SQL_GET_USER({ phone_number }).one(new HttpError(400, 'User not found'));

    const isPasswordCorrect = await bcrypt.compare(password, userResult.password);
    if (!isPasswordCorrect) {
      throw new HttpError(400, 'Invalid phone number or password combination');
    }
    
    //Remove password from returned userobject
    const userDataToSend = {
      id: userResult.id,
      first_name: userResult.first_name,
      last_name: userResult.last_name,
      phone_number: userResult.phone_number,
      role: userResult.role,
      created_at: userResult.created_at,
      updated_at: userResult.updated_at,
    };

    const token = generateToken(userResult.id, userResult.role);
    res.setHeader('X-Auth-Token', token).json(userDataToSend);
  });
};
