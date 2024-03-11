import { Router } from 'express';
import { generateRandomToken } from '../../middleware/generateRandomToken';
import bcrypt from 'bcrypt';
import { HttpError } from '../../middleware/errorMiddleware';
import { UserSchema } from '../../types';
import { sql } from '../../db';
import sendSms from '../../services/twilio';

const SQL_GET_SECURITY_ANSWERS = sql<{ user_id: string }, { question_id: string; answer: string }>(
  `SELECT question_id, answer FROM security_answers WHERE user_id = :user_id`
);

const SQL_GET_SECURITY_QUESTIONS = sql<{ user_id: string },{ question: string; question_id: string }>(`
  SELECT sq.id AS question_id, sq.question FROM security_answers sa INNER JOIN security_questions sq ON sa.question_id = sq.id WHERE sa.user_id = :user_id
`);

const SQL_GET_USER = sql<{ phone_number: string },Pick<UserSchema, 'id' | 'first_name' | 'last_name' | 'role' | 'created_at' | 'updated_at'>>(`
  SELECT id, first_name, last_name, role, created_at, updated_at FROM users WHERE phone_number = :phone_number
`);

const SQL_RESET_PASSWORD = sql<{ password: string; user_id: string }, { phone_number: string }>(`
  UPDATE users SET password = $1 WHERE user_id = :user_id
`);

const SQL_SAVE_TOKEN = sql<{ user_id: string; token: string }, { token: string }>(`
  INSERT INTO reset_tokens (user_id, token) VALUES (:user_id, :token) RETURNING token
`);

const SQL_CHECK_TOKEN_EXISTS = sql<{ user_id: string; reset_token: string },{ token_exists: boolean }>(`
  SELECT EXISTS(SELECT * FROM reset_tokens WHERE user_id = :user_id AND token = :reset_token ) AS token_exists
`);

const SQL_UPDATE_TOKEN_USAGE = sql<{ user_id: string; reset_token: string }, Record<string, never>>(`
  UPDATE reset_tokens SET used = TRUE, used_at = CURRENT_TIMESTAMP WHERE user_id = :user_id AND token = :reset_token
`);

const SQL_GET_TOKEN_INFO = sql<{ user_id: string; reset_token: string }, { used: boolean }>(`
  SELECT used FROM reset_tokens WHERE user_id = :user_id AND token = :reset_token
`);

interface SecurityAnswersRequest {
  message: string;
  user_id: string;
  answers: { question_id: string; answer: string }[];
}

export const initiatePasswordReset = (router: Router) => {
  router.post<string,Record<string, never>,{ message: string },{ phone_number: string },Record<string, never>>(
    '/forget-password-request', 
    async (req, res) => {
      const { phone_number } = req.body;
      const user = await SQL_GET_USER({ phone_number }).one(new HttpError(404, 'User not found.'));
      const resetToken = generateRandomToken();
      const token = await SQL_SAVE_TOKEN({ user_id: user.id, token: resetToken }).one(
        new HttpError(500, 'Error saving token')
      );
      const actualToken = token.token;
      sendSms(
        phone_number,
        `Your password reset token is: ${actualToken}. It expires in 10 minutes. Do not share with anyone.`
      );
      res.json({ message: 'Password reset token generated and sent successfully.' });
    });
};
interface securityQuestions{
  securityQuestions: { question_id: string; question: string }[]
}
export const verifyPasswordResetToken = (router: Router) => {
  router.post<Record<string, never>, securityQuestions, { user_id: string; reset_token: string }, Record<string, never>, Record<string, never>>(
    '/verify-token', 
    async (req, res) => {
      const { user_id, reset_token } = req.body;
      const tokenExists = await SQL_CHECK_TOKEN_EXISTS({ user_id, reset_token }).one();
      if (!tokenExists) {
        throw new HttpError(401, 'Invalid token');
      }
      const tokenInfo = await SQL_GET_TOKEN_INFO({ user_id, reset_token }).one();
      if (tokenInfo.used) {
        throw new HttpError(401, 'Token has already been used');
      }
      await SQL_UPDATE_TOKEN_USAGE({ user_id, reset_token }).exec();
      const securityQuestions = await SQL_GET_SECURITY_QUESTIONS({ user_id })
        .many()
        .catch(() => {
          throw new HttpError(
            404,
            'No security questions found for you. Contact Support for assistance'
          );
        });
      res.json({ securityQuestions });
    });
};

export const verifySecurityAnswers = (router: Router) => {
  router.post<string,Record<string, never>,{ message: string },SecurityAnswersRequest,Record<string, never>>(
    '/verify-security-answers', 
    async (req, res) => {
      const { answers, user_id } = req.body;
      const userSecurityAnswers = await SQL_GET_SECURITY_ANSWERS({ user_id }).many();
      const incorrectAnswers: string[] = [];
      answers.forEach(({ question_id, answer }: { question_id: string; answer: string }) => {
        const storedAnswer = userSecurityAnswers.find(
          (a: { question_id: string; answer: string }) => a.question_id === question_id
        );
        if (!storedAnswer || !bcrypt.compare(answer, storedAnswer.answer)) {
          incorrectAnswers.push(question_id);
        }
      });
      if (incorrectAnswers.length > 0) {
        throw new HttpError(401, `Incorrect answers. Contact customer service for help.`);
      }
      res.json({
        message: 'Security questions answered successfully. You can now reset your password.',
      });
    });
};

export const resetPassword = (router: Router) => {
  router.post<string,Record<string, never>,{ message: string },{ new_password: string; user_id: string },Record<string, never>>(
    '/reset', 
    async (req, res) => {
      const { new_password, user_id } = req.body;
      const hashPassword = bcrypt.hashSync(new_password, 10);
      await SQL_RESET_PASSWORD({ user_id: user_id, password: hashPassword }).exec();
      res.json({ message: 'Password updated successfully. Login' });
    });
};
