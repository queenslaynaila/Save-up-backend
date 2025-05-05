import Router from '../../router';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { resetPasswordLimiter } from '../../services/rateLimit';
import { sql } from '../../db';
import sendSms from '../../services/sms';
import { generateToken } from '../../utils';
import { userContactDetailsSchema } from '../users/schema';

const resetTokenSchema = z.object({
  user_id: z.number().int().min(1),
  xid: z.number().int().min(1),
  token: z.string(),
  reason: z.enum(['Reset', 'Update', 'Unlock']),
  created_at: z.string(),
  used_at: z.string().optional(),
  expired_at: z.string()
});

export type ResetToken = z.infer<typeof resetTokenSchema>;

const SQL_SAVE_TOKEN = sql<
Pick<ResetToken, 'token' | 'reason'> & {phone_number:string},
{user_id: number}
>(`
 INSERT INTO reset_tokens (
  user_id, 
  xid, 
  token, 
  reason
)
  SELECT 
    user_contact_details.id,
    COALESCE(MAX(reset_tokens.xid), 0) + 1,
    :token,
    :reason
  FROM user_contact_details
  LEFT JOIN reset_tokens
    ON user_contact_details.id = reset_tokens.user_id
  WHERE user_contact_details.phone_number = :phone_number
  GROUP BY user_contact_details.id
  RETURNING user_id;
`);

function generateOtp(): string {
  const min = 1000;
  const max = 9999;
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  return randomNumber.toString();
}

const initiatePinReset = (router: Router) => {
  router.post({
    path: '/pin-reset-token',
    summary: 'Send PIN reset token',
    schema: {
      body: userContactDetailsSchema.pick({
        phone_number: true
      })
    },
    middlewares: [resetPasswordLimiter],
    handler: async (req, res) => {
      const { phone_number } = req.body;
      const resetToken = generateOtp();
      const hashedResetToken = await bcrypt.hash(resetToken, 10);

      const userId = await SQL_SAVE_TOKEN({
        phone_number,
        token: hashedResetToken,
        reason: 'Reset'
      }).oneFirst();

      sendSms(
        phone_number,
        'Hello, your PIN reset verification code is: ' + resetToken
        + '. It expires in 10 minutes. Do not share with anyone.'
      ).catch(console.error);

      res
        .setHeader('Reset', generateToken(userId, '10m', 1))
        .sendStatus(204);
    }
  });
};

export default initiatePinReset;