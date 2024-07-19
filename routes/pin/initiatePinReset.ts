import { Router  } from 'express';
import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import { resetPasswordLimiter } from '../../services/rateLimit';
import { sql } from '../../db';
import { generateResetPin } from '../../middleware/generateResetPin';
import { HttpError } from '../../middleware/errorMiddleware';
import { 
  StatusCodeInterface, 
  GetByPhoneInterface,  
  GetByIdInterface  
} from '../../globalTypes';
import { 
  TokenInterface, 
  InitiatePasswordResetInterface, 
  PhoneReason 
} from './types'

const SQL_GET_USER = sql<GetByPhoneInterface,  GetByIdInterface>(`
  SELECT id 
  FROM user_contact_details 
  WHERE phone_number = :phone_number;
`);

const SQL_SAVE_TOKEN = sql<InitiatePasswordResetInterface, TokenInterface>(`
  INSERT INTO reset_tokens (user_id, xid, token, reason)
  SELECT :user_id,
          COALESCE(MAX(xid), 0) + 1,
          :token,
          :reason
  FROM reset_tokens
  WHERE user_id = :user_id;
`);

export default  (router: Router) => {
  router.post<Record<string,never>, StatusCodeInterface, PhoneReason, 
  Record<string,never>>(
    '/',
    resetPasswordLimiter,
    async (req, res) => {
      const { phone_number } = req.body;
      const user = await SQL_GET_USER({ phone_number })
        .one(new HttpError(404));

      const resetToken =  generateResetPin();
      const hashedResetToken = await bcrypt.hash(resetToken, 10);
      await SQL_SAVE_TOKEN({ 
        user_id: user.id, 
        token:hashedResetToken, 
        reason:req.body.reason
      }).exec();      

      const step1TokenPayload = { id: user.id, step:1 };
      const resetTokenHeader = jwt.sign(
        step1TokenPayload,
        process.env.JWT_SECRET as Secret, 
        { expiresIn: '15m' }
      );

      res.setHeader('reset-token', resetTokenHeader)
        .sendStatus(204);
    });
};