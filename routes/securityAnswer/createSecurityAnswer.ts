import { FastifyRequest, FastifyReply,FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import { HttpError } from '../../middleware/errorMiddleware';
import { createSecurityAnswerSchema } from '../../types';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';
import  { validateRequest } from '../../middleware/validationMiddleware';

const SQL_GET_USER_PHONE_NUMBER = sql<{ userId: number }, { phone_number: string }>(`
  SELECT phone_number FROM users_phone WHERE id = :userId
`);

const SQL_GET_USER_PASSWORD = sql<{ userId: number }, { password: string }>(`
  SELECT password FROM users WHERE id = :userId
`)

const SQL_CREATE_ANSWER = sql<z.infer<typeof createSecurityAnswerSchema>,Record<string, never>>(`
  INSERT INTO security_answers (id,question_id, user_id, answer) 
  SELECT COALESCE((SELECT MAX(id) FROM security_answers WHERE user_id = :user_id), 0) + 1,
  :question_id, :user_id, :answer
`);

export default async (fastify: FastifyInstance) => {
  fastify.post<
  { Body:typeof createSecurityAnswerSchema },
  { message: string }
  >(
    '/',
    { preHandler:[ authMiddleware(),validateRequest(createSecurityAnswerSchema) ]}, 
    async (request: FastifyRequest<{Body:typeof createSecurityAnswerSchema }>, reply: FastifyReply) => {
      const { question_id, user_id, answer } = request.body;
      const normalizedAnswer = answer.toLowerCase();
      const [phoneResult, result] = await Promise.all([
        SQL_GET_USER_PHONE_NUMBER({ userId: user_id }).one(),
        SQL_GET_USER_PASSWORD({ userId: user_id }).one(),
      ]);

      const phoneNumberHash = await bcrypt.hash(phoneResult.phone_number, 10);
      const password = result.password;
      const hashedAnswer = await bcrypt.hash(normalizedAnswer, 10);

      if (hashedAnswer === phoneNumberHash || hashedAnswer === password) {
        throw new HttpError(400, 'Please avoid using your password or phone number as your security answer.');
      }

      await SQL_CREATE_ANSWER({ question_id, user_id, answer: hashedAnswer }).exec();
      reply.code(201).send({ message: 'Security answer created successfully' });
    }
  );
};

