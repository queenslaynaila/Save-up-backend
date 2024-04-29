import { Router  } from 'express';
import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import { sql } from '../../db';
import { generateResetPin } from '../../middleware/generateResetPin';
import sendSms from '../../services/twilio';
import { HttpError } from '../../middleware/errorMiddleware';
import {  MessageInterface, GetByPhoneInterface,  GetByIdInterface  } from '../../globalTypes/index';
import { TokenInterface, InitiatePasswordResetInterface } from './types'

const SQL_GET_USER = sql<GetByPhoneInterface,  GetByIdInterface>(`
  SELECT id FROM user_contact_details WHERE phone_number = :phoneNumber
`);

const SQL_SAVE_TOKEN = sql<InitiatePasswordResetInterface, TokenInterface>(`
  INSERT INTO reset_tokens (id, user_id, token)
  VALUES ((SELECT COALESCE(MAX(id), 0) + 1 FROM reset_tokens WHERE user_id = :userId), :userId, :token)
`);

export default  (router: Router) => {
  router.post<Record<string,never>, MessageInterface, GetByPhoneInterface, Record<string,never>>(
    '/forget-password',
    async (req, res) => {
      const { phoneNumber } = req.body;
      const user = await SQL_GET_USER({ phoneNumber }).one(new HttpError(404, 'User not found.'));
      const resetToken =  generateResetPin();
      const hashedResetToken = await bcrypt.hash(resetToken, 10);
      await SQL_SAVE_TOKEN({ userId: user.id, token:hashedResetToken }).exec();        
      const resetTokenPayload = { id: user.id };
      const resetTokenHeader = jwt.sign(resetTokenPayload, process.env.JWT_SECRET as Secret, { expiresIn: '15m' });
      sendSms(
        phoneNumber,
        `Your password reset token is: ${resetToken}. It expires in 10 minutes. Do not share with anyone.`
      );
      res.setHeader('X-Reset-Token', resetTokenHeader).json({ message: 'Password reset token generated and sent successfully.' });
    });
};
  