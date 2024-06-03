import { Router } from 'express';
import bcrypt from 'bcrypt';
import { sql } from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/authorization';
import  { validateRequest } from '../../middleware/validationMiddleware';
import { UpdatePhoneInterface, updateUserPhoneSchema } from './types';

const SQL_GET_USER_PIN = sql<{ userId: number },{ pin: string }>(`
  SELECT pin FROM users WHERE id = :userId
`);

const SQL_UPDATE_PHONE = sql<{ phone_number: string; userId: number }, Record<string,never>>(`
   UPDATE user_contact_details
   SET phone_number = :phone_number 
   WHERE id = :userId
`);

export default (router: Router) => {
  router.patch<{ id: string },{ message: string }, UpdatePhoneInterface , Record<string,never>>(
    '/', 
    authMiddleware(), 
    validateRequest(updateUserPhoneSchema),
    async (req, res) => {
      const userId= req.user!.id;
      const userPassword = await SQL_GET_USER_PIN({ userId}).one(
        new HttpError(400, 'User not found')
      );
      if (!await bcrypt.compare(req.body.pin, userPassword.pin)) {
        throw new HttpError(401, 'Invalid password');
      }
      await SQL_UPDATE_PHONE({ phone_number:req.body.phone_number, userId}).exec();
      res.sendStatus(204);
    });
};