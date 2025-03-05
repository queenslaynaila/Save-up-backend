import Router from '../../router';
import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import { sql } from '../../db';
import HttpError from '../../httpError';
import { ResetToken } from './schema';
import { z } from 'zod';
import Config from '../../config';
import { authenticateResetTokenAndCheckStep } from '../../utils';

const SQL_GET_SECURITY_QUESTIONS = sql<{ user_id: number }, { id: number; question: string }>(`
  SELECT 
        security_questions.id, 
        security_questions.question 
  FROM security_answers 
  INNER JOIN security_questions 
  ON security_answers.question_id = security_questions.id 
  WHERE security_answers.user_id = :user_id;
`);

const SQL_GET_RESET_TOKEN = sql<
Pick<ResetToken, 'reason' | 'user_id'>,
Pick<ResetToken, 'token'>>(`
  SELECT token
  FROM reset_tokens 
  WHERE user_id = :user_id
  AND reason = :reason
  AND used_at IS NULL 
  AND expired_at > NOW()
  ORDER BY xid DESC 
  LIMIT 1;
`);

const SQL_UPDATE_TOKEN_USAGE = sql<Pick<ResetToken, 'reason' | 'user_id'|'token'>, Record<string, never>>(`
  UPDATE reset_tokens 
  SET used_at = NOW() 
  WHERE user_id = :user_id
  AND token = :token
  AND reason = :reason
  AND used_at IS NULL 
`);

const questionsSchema = z.object({
  id: z.number().min(1),
  question: z.string()
});

const verifyPinResetToken = (router: Router) => {
  router.route({
    method: 'patch',
    path: '/verify',
    summary: 'Verify PIN reset token',
    description: 'Verify the PIN reset token provided by the user',
    request: {
      body: z.object({
        reset_token: z.string().regex(/^\d{4}$/)
      })
    },
    response: {
      200: {
        schema: z.array(questionsSchema)
      }
    },
    middlewares: [authenticateResetTokenAndCheckStep(1)],
    handler: async (req, res) => {
      const { reset_token } = req.body;
      const user_id = req.user!.id;

      const { token } = await SQL_GET_RESET_TOKEN({
        user_id,
        reason: 'Reset'
      }).one(new HttpError(404));

      if (!await bcrypt.compare(reset_token, token)) {
        throw new HttpError(401);
      }

      await SQL_UPDATE_TOKEN_USAGE({
        reason: 'Reset',
        user_id,
        token
      }).exec();
      const securityQuestions = await SQL_GET_SECURITY_QUESTIONS({ user_id }).many();
      if (securityQuestions.length === 0) {
        const step4TokenPayload = { id: user_id, step: 3 };
        const step4TokenHeader = jwt.sign(
          step4TokenPayload,
          Config.JWT_SECRET as Secret,
          { expiresIn: '15m' }
        );
        return res.setHeader('Reset', step4TokenHeader).sendStatus(204);
      }

      const step2TokenPayload = { id: user_id, step: 2 };
      const step2TokenHeader = jwt.sign(
        step2TokenPayload,
        Config.JWT_SECRET as Secret,
        { expiresIn: '15m' }
      );
      return res.setHeader('Reset', step2TokenHeader)
        .json(securityQuestions);
    }
  });
};

export default verifyPinResetToken;