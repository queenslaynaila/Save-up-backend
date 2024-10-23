import { Router } from 'express';
import bcrypt from 'bcrypt';
import { sql } from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/authorization';
import  validateRequest from '../../middleware/validationMiddleware';
import { loginSchema, PhoneNoUpdateType } from './types';

const SQL_GET_USER_PIN = sql<{ id: number }, { pin: string }>(`
  SELECT pin FROM users WHERE id = :id
`);

const SQL_UPDATE_PHONE = sql<{ phone_number: string; id: number }, {updated_phone_number:string}>(`
   SELECT  update_phone_number(:id, :phone_number)
`);

export default (router: Router) => {
  router.patch<Record<string,never>, {updated_phone_number:string}, PhoneNoUpdateType ,
  Record<string,never>>(
    '/phone-number', 
    authMiddleware(),
    validateRequest({ body:loginSchema }), 
    async (req, res) => {
      const id = req.user!.id;
      const userPassword = await SQL_GET_USER_PIN({ 
        id 
      }).one( new HttpError(400));
      
      if (!await bcrypt.compare(req.body.pin, userPassword.pin)) {
        throw new HttpError(401);
      }

      const phone = await SQL_UPDATE_PHONE({
        phone_number:req.body.phone_number,
        id
      }).one();
      res.json(phone);
    });
};