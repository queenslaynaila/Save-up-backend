import Router from '../../router';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { resetPasswordLimiter } from '../../services/rateLimit';
import { sql } from '../../db';
import HttpError from '../../httpError';
import sendSms from '../../services/sms';
import { generateToken } from '../../utils';

const resetTokenSchema = z.object({
  user_id: z.number().min(1),
  xid: z.number().min(1),
  token: z.string(),
  reason: z.enum(['Reset', 'Update', 'Unlock']),
  created_at: z.string(),
  used_at: z.string().optional(),
  expired_at: z.string()
});

export type ResetToken = z.infer<typeof resetTokenSchema>;

const SQL_GET_USER = sql<{ 
  phone_number: string 
}, { 
  id: number 
}>(`
  SELECT id 
  FROM user_contact_details 
  WHERE phone_number = :phone_number
`);

const SQL_SAVE_TOKEN = sql<
  Pick<ResetToken, 'user_id' | 'token' | 'reason'>, 
  Pick<ResetToken, 'token'>
>(`
  INSERT INTO reset_tokens (
    user_id, 
    xid, 
    token, 
    reason
  )
  SELECT 
    :user_id,
    COALESCE(MAX(xid), 0) + 1,
    :token,
    :reason
  FROM reset_tokens
  WHERE user_id = :user_id
  RETURNING token
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
    path: '/pin-reset-token',
    summary: 'Send PIN reset token',
    request: {
      body: z.object({
        phone_number: z.string().regex(/^\+\d{1,4}\d{9}$/)
      })
    },
    middlewares: [resetPasswordLimiter],
    response: {
      204: {
        schema: undefined,
        headers: z.object({
          Reset: z.string()
        })
      }
    },
    handler: async (req, res) => {
      const { phone_number } = req.body;
      
      const user = await SQL_GET_USER({ 
        phone_number 
      }).one(new HttpError(400));

      const resetToken = generateOtp();
      const hashedResetToken = await bcrypt.hash(resetToken, 10);

      await SQL_SAVE_TOKEN({
        user_id: user.id,
        token: hashedResetToken,
        reason: 'Reset'
      }).exec();

      const resetTokenHeader = generateToken(
        user.id,
        new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        1,
      );

      sendSms(
        phone_number,
        'Hello, your PIN reset verification code is: ' + resetToken +
        '. It expires in 10 minutes. Do not share with anyone.'
      );

      res
        .setHeader('Reset', resetTokenHeader)
        .sendStatus(204);
    }
  });
};

export default initiatePinReset;