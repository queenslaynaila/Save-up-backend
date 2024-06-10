import { Router  } from 'express';
import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import { sql } from '../../db';
import { generateResetPin } from '../../middleware/generateResetPin';
import sendSms from '../../services/twilio';
import { HttpError } from '../../middleware/errorMiddleware';
import {  StatusCodeInterface, GetByPhoneInterface,  GetByIdInterface  } from '../../globalTypes/index';
import { TokenInterface, InitiatePasswordResetInterface } from './types'

const SQL_GET_USER = sql<GetByPhoneInterface,  GetByIdInterface>(`
  SELECT id 
  FROM user_contact_details 
  WHERE phone_number = :phone_number
`);

const SQL_SAVE_TOKEN = sql<InitiatePasswordResetInterface, TokenInterface>(`
  INSERT INTO reset_tokens (user_id, xid, token)
  SELECT :user_id,
          COALESCE(MAX(xid), 0) + 1,
          :token
  FROM reset_tokens
  WHERE user_id = :user_id
`);

export default  (router: Router) => {
  router.post<Record<string,never>, StatusCodeInterface, GetByPhoneInterface, Record<string,never>>(
    '/',
    async (req, res) => {
      const { phone_number } = req.body;
      const user = await SQL_GET_USER({ phone_number })
        .one(new HttpError(404, 'User not found.'));

      const resetToken =  generateResetPin();
      const hashedResetToken = await bcrypt.hash(resetToken, 10);
      await SQL_SAVE_TOKEN({ user_id: user.id, token:hashedResetToken }).exec();      

      const resetTokenPayload = { id: user.id };
      const resetTokenHeader = jwt.sign(resetTokenPayload, process.env.JWT_SECRET as Secret, { expiresIn: '15m' });
      sendSms(
        phone_number,
        `Your password reset token is: ${resetToken}. It expires in 10 minutes. Do not share with anyone.`
      );
      res.setHeader('reset-token', resetTokenHeader).sendStatus(201);
    });
};