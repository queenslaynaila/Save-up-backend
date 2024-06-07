import { Router } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import sendSms from '../../services/twilio';
import bcrypt from 'bcrypt'; 
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import { generateResetPin } from '../../middleware/generateResetPin';
import { securityAnswerValidationSchema} from './types'
import { StatusCodeInterface, IdParamInterface } from '../../globalTypes/index'; 

const SQL_UPDATE_SECURITY_ANSWER = sql< {user_id: number, token: string}, {phone_number: string}>(`
   SELECT update_security_answer(:user_id, token)
`);

export default (router: Router) => {
  router.patch<IdParamInterface, StatusCodeInterface, Record<string,never>, Record<string,never>>(
    '/:id',
    authMiddleware(),
    validateRequest(securityAnswerValidationSchema),
    async (req, res) => {
      const resetToken =  generateResetPin();
      const hashedResetToken = await bcrypt.hash(resetToken, 10);
      const { phone_number }: { phone_number: string } = await SQL_UPDATE_SECURITY_ANSWER({ 
        user_id:req.user!.id, 
        token: hashedResetToken })
        .one();
      const resetTokenPayload = { id: req.user!.id };
      const resetTokenHeader = jwt.sign(resetTokenPayload, process.env.JWT_SECRET as Secret, { expiresIn: '15m' });
      sendSms(
        phone_number,
        `Your token is: ${resetToken}. It expires in 10 minutes. Do not share with anyone.`
      );
      res.setHeader('reset-token', resetTokenHeader).sendStatus(201);
    } 
  );
};
