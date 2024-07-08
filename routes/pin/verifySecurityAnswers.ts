import { Router  } from 'express';
import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import { sql } from '../../db';
import {  validateStepToken } from '../../middleware/resetTokenMIddleware'
import { HttpError } from '../../middleware/errorMiddleware';
import { StatusCodeInterface, GetByUserInterface } from '../../globalTypes/index';
import { VerifyAnswerInterface, SecurityAnswersRequestInterface } from './types'

const SQL_GET_SECURITY_ANSWERS = sql<GetByUserInterface, VerifyAnswerInterface>(`
  SELECT question_id, answer 
  FROM security_answers 
  WHERE user_id = :user_id
`);

export default (router: Router) => {
  router.get<Record<string,never>, StatusCodeInterface, SecurityAnswersRequestInterface, 
  Record<string,never>>(
    '/verify-answers',
    validateStepToken,
    async (req, res) => {
      const step = req.user!.step;
      if (step !== 2) {
        throw new HttpError(422, 'ERR_STEP_SKIPPED');
      }
      const { answers } = req.body;
      const user_id = req.user!.id;

      const userSecurityAnswers = await SQL_GET_SECURITY_ANSWERS({ user_id }).many();
      if (userSecurityAnswers.length === 0) {
        throw new HttpError(404, 'ERR_QUESTIONS_NOT_SET');
      }
      
      const incorrectAnswers: number[] = [];
      for (const submittedAnswer of answers) {
        const storedAnswer = userSecurityAnswers.find(
          a => a.question_id === submittedAnswer.question_id
        );
        if (!storedAnswer || !(await bcrypt.compare(submittedAnswer.answer, storedAnswer.answer))) {
          incorrectAnswers.push(submittedAnswer.question_id);
        }
      }

      if (incorrectAnswers.length > 1) {
        throw new HttpError(401, `ERR_INCORRECT_ANSWER`);
      }

      const step3TokenPayload = { id: user_id, step: 3 };
      const step3TokenHeader = jwt.sign(
        step3TokenPayload, process.env.JWT_SECRET as Secret,
        { expiresIn: '15m' }
      );
      res.setHeader('reset-token', step3TokenHeader)
        .sendStatus(204);
    }
  );
};