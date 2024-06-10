import { Router } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import bcrypt from 'bcrypt'; 
import { sql } from '../../db';
import sendSms from '../../services/twilio';
import authMiddleware from '../../middleware/authorization';
import { generateResetPin } from '../../middleware/generateResetPin';
import {  AnswerTokenType} from './types'
import { StatusCodeInterface } from '../../globalTypes/index'; 

const SQL_UPDATE_SECURITY_ANSWER = sql<AnswerTokenType, { phone_number: string }>(`
   SELECT update_security_answer(:user_id, token)
`);

export default (router: Router) => {
  router.get<Record<string,never>, StatusCodeInterface, AnswerTokenType, Record<string,never>>(
    '/verify',
    authMiddleware(),
    async (req, res) => {
      const resetToken =  generateResetPin();
      const hashedResetToken = await bcrypt.hash(resetToken, 10);
      const { phone_number }: { phone_number: string } = await SQL_UPDATE_SECURITY_ANSWER({ 
        user_id:req.user!.id, 
        token: hashedResetToken }
      ).one();
      const resetTokenHeader = jwt.sign(
        { id: req.user!.id }, 
        process.env.JWT_SECRET as Secret, 
        { expiresIn: '15m' }
      );
      sendSms(
        phone_number,
        `Your token is: ${resetToken}. It expires in 10 minutes. Do not share with anyone.`
      );
      res.setHeader('reset-token', resetTokenHeader).sendStatus(204);
    } 
  );
};