/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import Router from '../../router';
import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import { sql } from '../../db';
import { validateStepToken } from '../../middleware/resetTokenMIddleware';
import { HttpError } from '../../middleware/errorMiddleware';
import { z } from 'zod';

export const verifyAnswerSchema = z.object({
  question_id: z.number(),
  answer: z.string()
});

const securityAnswersRequestSchema = z.object({
  message: z.string(),
  user_id: z.number(),
  answers: z.array(verifyAnswerSchema)
});

const SQL_GET_SECURITY_ANSWERS = sql<{user_id:number}, {question_id: number;answer: string;}>(`
  SELECT question_id, answer 
  FROM security_answers 
  WHERE user_id = :user_id
`);

const verifySecurityAnswers = (router: Router) => {
  router.route({
    method: 'get',
    path: '/verify-security-answers',
    summary: 'Verify security answers',
    schema: {
      body: securityAnswersRequestSchema
    },
    response: {
      statusCode: 204
    },
    middlewares: [validateStepToken],
    handler: async (req, res) => {
      const step = req.user!.step;
      if (step !== 2) {
        throw new HttpError(422);
      }
      const { answers } = req.body;
      const user_id = req.user!.id;

      const userSecurityAnswers = await SQL_GET_SECURITY_ANSWERS({ user_id }).many();
      if (userSecurityAnswers.length === 0) {
        throw new HttpError(404);
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
        throw new HttpError(401);
      }

      const step3TokenPayload = { id: user_id, step: 3 };
      const step3TokenHeader = jwt.sign(
        step3TokenPayload,
        process.env.JWT_SECRET as Secret,
        { expiresIn: '15m' }
      );
      res.setHeader('Reset', step3TokenHeader)
        .sendStatus(204);
    }
  });
};

export default verifySecurityAnswers;