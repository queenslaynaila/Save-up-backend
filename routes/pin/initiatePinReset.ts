import Router from '../../router';
import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import { z } from 'zod';
import { resetPasswordLimiter } from '../../services/rateLimit';
import { sql } from '../../db';
import { ResetToken } from './schema';
import HttpError from '../../httpError';
import sendSms from '../../services/sms';
import Config from '../../config';
import { generateToken } from '../../utils';

const SQL_GET_USER = sql<{ phone_number: string }, { id:number }>(`
  SELECT id 
  FROM user_contact_details 
  WHERE phone_number = :phone_number;
`);

const SQL_SAVE_TOKEN = sql<Pick<ResetToken, 'user_id' | 'token' | 'reason'>, Pick<ResetToken, 'token'>>(`
  INSERT INTO reset_tokens (user_id, xid, token, reason)
  SELECT :user_id,
         COALESCE(MAX(xid), 0) + 1,
         :token,
         :reason
  FROM reset_tokens
  WHERE user_id = :user_id
  RETURNING token;
`);

function generateOtp(): string {
  const min = 1000;
  const max = 9999;
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  return randomNumber.toString();
}

const initiatePinReset = (router: Router) => {
  router.route({
    method: 'post',
    path: '/request',
    summary: 'Initiate password reset',
    request: {
      body: z.object({ phone_number: z.string().regex(/^\+\d{1,4}\d{9}$/) })
    },
    middlewares: [resetPasswordLimiter],
    handler: async (req, res) => {
      const { phone_number } = req.body;
      const user = await SQL_GET_USER({ phone_number })
        .one(new HttpError(400));

      const resetToken = generateOtp();
      const hashedResetToken = await bcrypt.hash(resetToken, 10);

      await SQL_SAVE_TOKEN({
        user_id: user.id,
        token: hashedResetToken,
        reason: 'Reset'
      }).exec();

      const resetTokenHeader = generateToken(user.id, req.user!.role, '10m', 1)

      sendSms(
        phone_number,
        'Hello, your PIN reset verification code is: ' + resetToken
        + '. It expires in 10 minutes. Do not share with anyone.'
      );

      res.setHeader('Reset', resetTokenHeader)
        .sendStatus(204);
    }
  });
};

export default initiatePinReset;