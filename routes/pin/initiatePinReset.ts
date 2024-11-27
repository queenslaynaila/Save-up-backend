import Router from '../../router';
import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import { z } from 'zod';
import { resetPasswordLimiter } from '../../services/rateLimit';
import { sql } from '../../db';
import { generateResetPin } from '../../middleware/generateResetPin';
import { HttpError } from '../../middleware/errorMiddleware';
import { ResetToken } from './schema';
import logger from '../../logger';

const SQL_GET_USER = sql<{ phone_number: string }, { id:number }>(`
  SELECT id 
  FROM user_contact_details 
  WHERE phone_number = :phone_number;
`);

const SQL_SAVE_TOKEN = sql<Pick<ResetToken, 'user_id'| 'token' | 'reason'>, Pick<ResetToken, 'token'>>(`
  INSERT INTO reset_tokens (user_id, xid, token, reason)
  SELECT :user_id,
          COALESCE(MAX(xid), 0) + 1, 
          :token,
          :reason
  FROM reset_tokens
  WHERE user_id = :user_id
  RETURNING token;
`);

const initiatePinReset = (router: Router) => {
  router.route({
    method: 'post',
    path: '/request',
    summary: 'Initiate password reset',
    response: {
      statusCode: 204
    },
    schema: {
      body: z.object({ phone_number: z.string() })
    },
    middlewares: [resetPasswordLimiter],
    handler: async (req, res) => {
      const { phone_number } = req.body;
      const user = await SQL_GET_USER({ phone_number })
        .one(new HttpError(404));

      const resetToken = generateResetPin();
      const hashedResetToken = await bcrypt.hash(resetToken, 10);
      await SQL_SAVE_TOKEN({
        user_id: user.id,
        token: hashedResetToken,
        reason: 'Reset'
      }).exec();

      logger.info(`Reset token for user ${user.id} created and is ${resetToken}`);

      const step1TokenPayload = { id: user.id, step: 1 };
      const resetTokenHeader = jwt.sign(
        step1TokenPayload,
        process.env.JWT_SECRET as Secret,
        { expiresIn: '15m' }
      );

      res.setHeader('Reset', resetTokenHeader)
        .sendStatus(204);
    }
  });
};

export default initiatePinReset;