/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import Router from '../../router';
import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import { sql } from '../../db';
import HttpError from '../../httpError';
import { z } from 'zod';
import { authenticateResetTokenAndCheckStep} from '../../utils';
import Config from '../../config';
const verifyAnswerSchema = z.object({
  question_id: z.number().min(1),
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
    request: {
      body: verifyAnswerSchema.array()
    },
    response: {
      204: {}
    },
      middlewares: [authenticateResetTokenAndCheckStep(2)],
    handler: async (req, res) => {
      const answers = req.body;

      const user_id = req.user!.id;

      const userSecurityAnswers = await SQL_GET_SECURITY_ANSWERS({ user_id }).many();
      if (userSecurityAnswers.length === 0) {
        throw new HttpError(404);
      }

      const answerMap = new Map(
        userSecurityAnswers.map(({ question_id, answer }) => [question_id, answer])
      );

      const incorrectAnswers: number[] = [];
      for (const { question_id, answer } of answers) {
        const hashedAnswer = answerMap.get(question_id);

        if (!hashedAnswer || !(await bcrypt.compare(answer, hashedAnswer))) {
          incorrectAnswers.push(question_id);
        }
      }

      if (incorrectAnswers.length > 2) {
        throw new HttpError(403);
      }

      const step3TokenPayload = { id: user_id, step: 3, role: req.user!.role };
      const step3TokenHeader = jwt.sign(
        step3TokenPayload,
        Config.JWT_SECRET as Secret,
        { expiresIn: '15m' }
      );

      res.setHeader('Reset', step3TokenHeader)
        .sendStatus(204);
    }
  });
};

export default verifySecurityAnswers;