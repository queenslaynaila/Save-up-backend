/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import Router from '../../router';
import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import { sql } from '../../db';
import HttpError from '../../httpError';
import { z } from 'zod';
import logger from '../../logger';
import { authenticateResetToken, checkResetStepProgression } from '../../authorization';

export const verifyAnswerSchema = z.object({
  question_id: z.number(),
  answer: z.string()
});

const SQL_GET_SECURITY_ANSWERS = sql<{user_id:number}, {question_id: number;answer: string;}>(`
  SELECT question_id, answer 
  FROM security_answers 
  WHERE user_id = :user_id
`);

const verifySecurityAnswers = (router: Router) => {
  router.route({
    method: 'post',
    path: '/verify-answers',
    summary: 'Verify security answers',
    schema: {
      body: verifyAnswerSchema.array()
    },
    response: {
      statusCode: 204
    },
    middlewares: [authenticateResetToken, checkResetStepProgression(2)],
    handler: async (req, res) => {
      const answers = req.body;
      logger.info(`user provided the foll ${JSON.stringify(answers)}`);
      const user_id = req.user!.id;

      const userSecurityAnswers = await SQL_GET_SECURITY_ANSWERS({ user_id }).many();
      if (userSecurityAnswers.length === 0) {
        throw new HttpError(404);
      }

      logger.info(`security answers found for user is ${JSON.stringify(userSecurityAnswers)}`);

      const answerMap = new Map(
        userSecurityAnswers.map(({ question_id, answer }) => [question_id, answer])
      );

      logger.info(`answer map is ${JSON.stringify(answerMap)}`);

      const mappedArray = userSecurityAnswers.map((
        { question_id, answer }
      ) => [question_id, answer]);
      logger.info(`Mapped array: ${JSON.stringify(mappedArray)}`);

      const incorrectAnswers: number[] = [];
      for (const { question_id, answer } of answers) {
        const hashedAnswer = answerMap.get(question_id);

        if (!hashedAnswer || !(await bcrypt.compare(answer, hashedAnswer))) {
          incorrectAnswers.push(question_id);
        }
      }

      logger.info(`incorect answers are ${incorrectAnswers}`);

      if (incorrectAnswers.length > 2) {
        throw new HttpError(403);
      }

      const step3TokenPayload = { id: user_id, step: 3 };
      const step3TokenHeader = jwt.sign(
        step3TokenPayload,
        process.env.JWT_SECRET as Secret,
        { expiresIn: '15m' }
      );
      logger.info(`User ${user_id} completed step 3.Questions answered well header sent moving to  Header is ${step3TokenHeader}`);
      res.setHeader('Reset', step3TokenHeader)
        .sendStatus(204);
    }
  });
};

export default verifySecurityAnswers;