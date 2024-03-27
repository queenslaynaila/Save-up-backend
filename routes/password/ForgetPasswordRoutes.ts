import { FastifyRequest, FastifyReply,FastifyInstance } from 'fastify';
import jwt, { Secret } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { HttpError } from '../../middleware/errorMiddleware';
import { generateRandomToken } from '../../middleware/generateRandomToken';
import sendSms from '../../services/twilio';
import { UserSchema } from '../../types';
import { sql } from '../../db';


declare module 'express-serve-static-core' {
  interface Request {
    userId?:number;
    isTokenGenerated: boolean;
  }
}

const SQL_GET_USER = sql<{ phone_number: string }, Pick<UserSchema, 'id'>>(
  `SELECT id FROM users_phone WHERE phone_number = :phone_number`
);

const SQL_SAVE_TOKEN = sql<{ user_id:number; token: string }, { token: string }>(`
  INSERT INTO reset_tokens (id,user_id, token)
  SELECT COALESCE((SELECT MAX(id) FROM reset_tokens WHERE user_id = :user_id), 0) + 1,:user_id, :token
  RETURNING token
`);

const SQL_UPDATE_TOKEN_USAGE = sql<{ user_id:number; reset_token: string }, Record<string, never>>(
  `UPDATE reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE user_id = :user_id AND token = :reset_token`
);

const SQL_RESET_PASSWORD = sql<{ password: string; id:number }, { phone_number: string }>(
  `UPDATE users SET password = $1 WHERE  id = :id`
);

const SQL_GET_SECURITY_ANSWERS = sql<{ user_id:number }, { question_id:number; answer: string }>(
  `SELECT question_id, answer FROM security_answers WHERE user_id = :user_id`
);

const SQL_GET_SECURITY_QUESTIONS = sql<{ user_id: number }, { question: string; question_id:number }>(
  `SELECT sq.id AS question_id, sq.question FROM security_answers sa INNER JOIN security_questions sq ON sa.question_id = sq.id WHERE sa.user_id = :user_id`
);

const verifyResetToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['reset-token'] as string;
  if (!token) {
    throw new HttpError(403, 'Access denied');
  }
  const resetTokenValue = token.split(' ')[1];
  jwt.verify(resetTokenValue, process.env.JWT_SECRET as Secret, (err, decoded) => {
    if (err) {
      return next(err);
    } else {
      const { userId } = decoded as { userId: number };
      req.userId = userId;
      next();
    }
  });
};



export const initiatePasswordReset= (fastify: FastifyInstance) =>{
  fastify.post<{ Body: { phone_number: string } }>(
    '/forget-password-request',
    { preHandler: app.rateLimit()}, 
    async (request: FastifyRequest<{ Body: { phone_number: string } }>, reply: FastifyReply) => {
      const { phone_number } = request.body;
      const user = await SQL_GET_USER({ phone_number }).one(new HttpError(404, 'User not found.'));
      const resetToken = generateRandomToken();
      const hashedResetToken = await bcrypt.hash(resetToken, 10);
      const token = await SQL_SAVE_TOKEN({ user_id: user.id, token: hashedResetToken }).one();
      const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '15m' });
      sendSms(
        phone_number,
        `Your password reset token is: ${token.token}. It expires in 10 minutes. Do not share with anyone.`
      );
      reply.header('X-Reset-Token', accessToken).send({ message: 'Password reset token generated and sent successfully.' });
   
    });
}


interface securityQuestions{
  securityQuestions: { question_id:number; question: string }[]
}

export const verifyPasswordResetToken = (fastify: FastifyInstance) => {
  fastify.post<{ Body: { user_id:number; reset_token: string } }>(
    '/verify-token',
    async (req: FastifyRequest<{ Body: { user_id:number; reset_token: string } }>, reply: FastifyReply) => {
      const { reset_token } = req.body;
      const user_id = req.userId!;
      await SQL_UPDATE_TOKEN_USAGE({ user_id, reset_token }).exec();
      const securityQuestions = await SQL_GET_SECURITY_QUESTIONS({ user_id }).many()
      reply.send({ securityQuestions });
    });
};

interface SecurityAnswersRequest {
  message: string;
  user_id:number;
  answers: { question_id:number; answer: string }[];
}

export const verifySecurityAnswers = (fastify: FastifyInstance) => {
  fastify.post<{ Body: { answers: { question_id:number; answer: string }[] } }>(
    '/verify-security-answers',
    async (req: FastifyRequest<{ Body: { answers: { question_id:number; answer: string }[] } }>, res: FastifyReply) => {
      const { answers } = req.body;
      const user_id = req.userId!;
      const userSecurityAnswers = await SQL_GET_SECURITY_ANSWERS({ user_id }).many();
      const incorrectAnswers: number[] = [];
      answers.forEach(({ question_id, answer }: { question_id:number; answer: string }) => {
        const storedAnswer = userSecurityAnswers.find(
          (a: { question_id:number; answer: string }) => a.question_id === question_id
        );
        if (!storedAnswer || !bcrypt.compare(answer.toLowerCase(), storedAnswer.answer)) {
          incorrectAnswers.push(question_id);
        }
      });
      if (incorrectAnswers.length > 0) {
        throw new HttpError(401, `Incorrect answers. Contact customer service for help.`);
      }
      res.send({
        message: 'Security questions answered successfully. You can now reset your password.',
      });
    });
};

export const resetPassword = (fastify: FastifyInstance) => {
  fastify.post<{ Body: { new_password: string; } }>(
    '/reset',
    async (req: FastifyRequest<{ Body: { new_password: string;} }>, res: FastifyReply) => {
      const { new_password } = req.body;
      const user_id = req.userId!;
      const hashPassword = bcrypt.hashSync(new_password, 10);
      await SQL_RESET_PASSWORD({ id: user_id, password: hashPassword }).exec();
      res.send({ message: 'Password updated successfully. Login' });
    });
};