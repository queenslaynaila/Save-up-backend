import { FastifyInstance, FastifyPluginAsync, FastifyRequest,FastifyReply } from 'fastify';
import { updateSecurityAnswerSchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth'; 

const SQL_UPDATE_SECURITY_ANSWER = sql<{ question_id: number; answer: string; user_id: number }, Record<string, never>>(`
  UPDATE security_answers
  SET answer = :answer
  WHERE question_id = :question_id AND user_id = :user_id
  RETURNING *
`);

const updateSecurityAnswerRoute: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.patch<Record<string, never>, Record<string, never>, typeof updateSecurityAnswerSchema>(
    '/',
    {
      preHandler: [authMiddleware()], 
      schema: {
        body: updateSecurityAnswerSchema,
      },
    },
    async (request: FastifyRequest<{ Body: typeof updateSecurityAnswerSchema }>, reply: FastifyReply) => {
      const { question_id, answer } = request.body;
      const userId = request.user!.id; 
      const updateResult = await SQL_UPDATE_SECURITY_ANSWER({
        question_id,
        answer,
        user_id: userId,
      }).one(new HttpError(404, 'Not found'));
      reply.send(updateResult);
    }
  );
};

export default updateSecurityAnswerRoute;
