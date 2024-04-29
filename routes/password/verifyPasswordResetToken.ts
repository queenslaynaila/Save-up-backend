import { Router  } from 'express';
import bcrypt from 'bcrypt';
import { sql } from '../../db';
import { verifyResetToken } from '../../middleware/resetTokenMIddleware'
import { VerifyTokenInterface, SecurityQuestionInterface, SecurityQuestionArray, UpdateTokenUsageInterface  } from './types';
import {  GetByUserInterface } from '../../globalTypes/index';

const SQL_GET_SECURITY_QUESTIONS = sql<GetByUserInterface, SecurityQuestionInterface>(`
  SELECT sq.id AS question_id, sq.question 
  FROM security_answers sa 
  INNER JOIN security_questions sq ON sa.question_id = sq.id 
  WHERE sa.user_id = :userId;
`);

const SQL_UPDATE_TOKEN_USAGE = sql<UpdateTokenUsageInterface, Record<string,never>>(`
  UPDATE reset_tokens 
  SET used_at = NOW() 
  WHERE user_id = :userId 
  AND token = :resetToken
`);

export default(router: Router) => {
  router.post<Record<string,never>, SecurityQuestionArray, VerifyTokenInterface, Record<string,never>, Record<string,never>>(
    '/verify-reset-token',
    verifyResetToken,
    async (req, res) => {
      const { resetToken } = req.body;
      const userId = req.user!.id;
      const hashedResetToken = await bcrypt.hash(resetToken, 10); 
      await SQL_UPDATE_TOKEN_USAGE({ userId, resetToken: hashedResetToken }).exec(); 
      const securityQuestions = await SQL_GET_SECURITY_QUESTIONS({ userId }).many();
      res.json(securityQuestions);
    }
  );
};
  