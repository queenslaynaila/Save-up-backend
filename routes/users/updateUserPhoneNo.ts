import { Router } from 'express';
import bcrypt from 'bcrypt';
import { sql } from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/authorization';
import  { validateRequest } from '../../middleware/validationMiddleware';
import { UpdatePhoneInterface, updateUserPhoneSchema } from './types';

const SQL_GET_USER_PIN = sql<{ userId: string },{ pin: string }>(`
  SELECT pin FROM users WHERE id = :userId
`);

const SQL_UPDATE_PHONE = sql<{ phoneNumber: string; userId: string }, Record<string,never>>(`
   UPDATE user_contact_details
   SET phone_number = :phoneNumber 
   WHERE id = :userId
`);

export default (router: Router) => {
  router.patch<{ id: string },{ message: string }, UpdatePhoneInterface , Record<string,never>>(
    '/update-phone/:id', 
    authMiddleware(), 
    validateRequest(updateUserPhoneSchema),
    async (req, res) => {
      const userId = req.params.id;
      const { pin, phoneNumber } = req.body;
      const userPassword = await SQL_GET_USER_PIN({ userId }).one();
      if (!await bcrypt.compare(pin, userPassword.pin)) {
        throw new HttpError(401, 'Invalid password');
      }
      await SQL_UPDATE_PHONE({ phoneNumber, userId }).exec();
      res.json({ message: 'Phone number updated. For continued security, please log in again with your new phone number.' });
    });
};
