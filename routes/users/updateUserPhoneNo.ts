import { Router } from 'express';
import bcrypt from 'bcrypt';
import { sql } from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/authorization';
import  { validateRequest } from '../../middleware/validationMiddleware';
import { loginSchema, PhoneNoUpdateType } from './types';
import { StatusCodeInterface } from '../../globalTypes/index';

const SQL_GET_USER_PIN = sql<{ id: number }, { pin: string }>(`
  SELECT pin FROM users WHERE id = :id
`);

const SQL_UPDATE_PHONE = sql<{ phone_number: string; id: number }, Record<string,never>>(`
   SELECT * FROM update_phone_number(:id, :phone_number)
`);

export default (router: Router) => {
  router.patch<Record<string,never>, StatusCodeInterface, PhoneNoUpdateType , Record<string,never>>(
    '/me', 
    authMiddleware(), 
    validateRequest(loginSchema),
    async (req, res) => {
      const id = req.user!.id
      const userPassword = await SQL_GET_USER_PIN({ id}).one(
        new HttpError(400, 'User not found')
      );
      if (!await bcrypt.compare(req.body.pin, userPassword.pin)) {
        throw new HttpError(401, 'Invalid password');
      }
      await SQL_UPDATE_PHONE({ phone_number:req.body.phone_number, id}).exec();
      res.sendStatus(204);
    });
};