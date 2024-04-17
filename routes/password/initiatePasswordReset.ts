import { Router  } from 'express';
import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import { sql } from '../../db';
import { generateResetPin } from '../../middleware/generateResetPin';
import sendSms from '../../services/twilio';
import { HttpError } from '../../middleware/errorMiddleware';

const SQL_GET_USER = sql<{ phone_number: string }, { id:number }>(`
  SELECT id FROM user_contacts WHERE phone_number = :phone_number
`);

const SQL_SAVE_TOKEN = sql<{ user_id:number; token: string }, { token: string }>(`
  INSERT INTO reset_tokens (id, user_id, token)
  VALUES ((SELECT COALESCE(MAX(id), 0) + 1 FROM reset_tokens WHERE user_id = :user_id), :user_id, :token)
`);

export default  (router: Router) => {
  router.post<Record<string,never>, { message: string }, { phone_number: string }, Record<string,never>>(
    '/forget-password',
    async (req, res) => {
      const { phone_number } = req.body;
      const user = await SQL_GET_USER({ phone_number }).one(new HttpError(404, 'User not found.'));
      const resetToken =  generateResetPin();
      const hashedResetToken = await bcrypt.hash(resetToken, 10);
      await SQL_SAVE_TOKEN({ user_id: user.id, token:hashedResetToken }).exec();        
      const resetTokenPayload = { id: user.id };
      const resetTokenHeader = jwt.sign(resetTokenPayload, process.env.JWT_SECRET as Secret, { expiresIn: '15m' });
      sendSms(
        phone_number,
        `Your password reset token is: ${resetToken}. It expires in 10 minutes. Do not share with anyone.`
      );
      res.setHeader('X-Reset-Token', resetTokenHeader).json({ message: 'Password reset token generated and sent successfully.' });
    });
};
  