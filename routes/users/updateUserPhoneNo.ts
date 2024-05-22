import { Router } from 'express';
import bcrypt from 'bcrypt';
import { sql } from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/authorization';
import  { validateRequest } from '../../middleware/validationMiddleware';
import { UpdatePhoneInterface, updateUserPhoneSchema } from './types';

const SQL_GET_USER_PIN = sql<{ user_id: number },{ pin: string }>(`
  SELECT pin FROM users WHERE id = :userId
`);

const SQL_UPDATE_PHONE = sql<{ phone_number: string; user_id: number }, Record<string,never>>(`
   UPDATE user_contact_details
   SET phone_number = :phone_number 
   WHERE id = :userId
`);

export default (router: Router) => {
  router.patch<{ id: string },{ message: string }, UpdatePhoneInterface , Record<string,never>>(
    '/update-phone-number/', 
    authMiddleware(), 
    validateRequest(updateUserPhoneSchema),
    async (req, res) => {
      const user_id= req.user!.id;
      const { pin, phone_number } = req.body;
      const userPassword = await SQL_GET_USER_PIN({ user_id}).one(
        new HttpError(400, 'User not found')
      );
      if (!await bcrypt.compare(pin, userPassword.pin)) {
        throw new HttpError(401, 'Invalid password');
      }
      await SQL_UPDATE_PHONE({ phone_number, user_id}).exec();
      res.json({ message: 'Phone number updated. For continued security, please log in again with your new phone number.' });
    });
};