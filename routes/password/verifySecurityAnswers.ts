import { Router  } from 'express';
import bcrypt from 'bcrypt';
import { sql } from '../../db';
import { verifyResetToken } from '../../middleware/resetTokenMIddleware'
import { HttpError } from '../../middleware/errorMiddleware';
import {  MessageInterface, GetByUserInterface } from '../../globalTypes';
import { VerifyAnswerInterface, SecurityAnswersRequestInterface } from './types'

const SQL_GET_SECURITY_ANSWERS = sql<GetByUserInterface, VerifyAnswerInterface>(`
  SELECT question_id, answer FROM security_answers WHERE user_id = :user_id
`);


export default (router: Router) => {
  router.post<Record<string,never>, MessageInterface, SecurityAnswersRequestInterface, Record<string,never>>(
    '/verify-security-answers',
    verifyResetToken,
    async (req, res) => {
      const { answers } = req.body;
      const user_id = req.user!.id;
      const userSecurityAnswers = await SQL_GET_SECURITY_ANSWERS({ user_id }).many();
     
      const incorrectAnswers: number[] = [];
        
      answers.forEach(({ question_id, answer }: { question_id:number; answer: string }) => {
        const storedAnswer = userSecurityAnswers.find((a: { question_id:number; answer: string }) => a.question_id === question_id);
        if (!storedAnswer || !bcrypt.compare(answer, storedAnswer.answer)) {
          console.log(storedAnswer)
          incorrectAnswers.push(question_id);
        }
      });
        
      if (incorrectAnswers.length > 0) {
        throw new HttpError(401, `Incorrect answers. Contact customer service for help.`);
      }
        
      res.json({
        message: 'Security questions answered successfully. You can now reset your password.',
      });
    }
  );
};