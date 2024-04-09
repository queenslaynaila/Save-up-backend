import { Router } from 'express';
import bcrypt from 'bcrypt';
import { sql } from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/auth';
import  { validateRequest } from '../../middleware/validationMiddleware';
import {UpdatePhoneInterface,  UpdateUserPhoneSchema} from '../../types';

const SQL_GET_USER_PIN = sql<{ userId: string },{ pin: string }>(`
  SELECT pin FROM users WHERE id = :userId
`);
const SQL_UPDATE_PHONE = sql<{ phone_number: string; userId: string }, { phone_number: string }>(`
   UPDATE users_contacts
   SET phone_number = :phone_number 
   WHERE id = :userId
   RETURNING phone_number`
);

export default (router: Router) => {
  router.patch<{ id: string },{ phone_number: string }, UpdatePhoneInterface , Record<string, never>>(
    '/update-phone/:id', 
    authMiddleware(), 
    validateRequest(UpdateUserPhoneSchema),
    async (req, res) => {
      const userId = req.params.id;
      const { pin, phone_number } = req.body;
      const userPassword = await SQL_GET_USER_PIN({ userId }).one(
        new HttpError(404, 'Not found')
      );
      if (!await bcrypt.compare(pin, userPassword.pin)) {
        throw new HttpError(401, 'Invalid password');
      }
      const updateResult = await SQL_UPDATE_PHONE({ phone_number, userId }).one();
      res.json(updateResult);
    });
};
