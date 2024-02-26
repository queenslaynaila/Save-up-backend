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
    const { password, phone_number } = req.body;

    const SQL_GET_USER = sql<{ phone_number: string; password: string  },ExtendedUserSchema>(`SELECT * from users where phone_number = :phone_number`);
 
    const userResult = await SQL_GET_USER({ phone_number, password}).one();

    if (!userResult || !(await bcrypt.compare(password, userResult.password))) {
      throw new HttpError(400, 'Invalid phone number or password combination');
    }
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
