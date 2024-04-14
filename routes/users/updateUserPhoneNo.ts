import { Router } from 'express';
import bcrypt from 'bcrypt';
import { sql } from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/auth';
import  { validateRequest } from '../../middleware/validationMiddleware';
import { UpdatePhoneInterface,  UpdateUserPhoneSchema} from '../../types';

const SQL_GET_USER_PIN = sql<{ userId: string },{ pin: string }>(`
  SELECT pin FROM users WHERE id = :userId
`);

const SQL_UPDATE_PHONE = sql<{ phone_number: string; userId: string }, Record<string,never>>(`
   UPDATE user_contacts
   SET phone_number = :phone_number 
   WHERE id = :userId
`);

export default (router: Router) => {
  router.patch<{ id: string },{ message: string }, UpdatePhoneInterface , Record<string, never>>(
    '/update-phone/:id', 
    authMiddleware(), 
    validateRequest(UpdateUserPhoneSchema),
    async (req, res) => {
      const userId = req.params.id;
      const { pin, phone_number } = req.body;
      const userPassword = await SQL_GET_USER_PIN({ userId }).one();
      if (!await bcrypt.compare(pin, userPassword.pin)) {
        throw new HttpError(401, 'Invalid password');
      }
      await SQL_UPDATE_PHONE({ phone_number, userId }).exec();
      res.json({ message: 'Phone number updated. For continued security, please log in again with your new phone number.' });
    });
};
