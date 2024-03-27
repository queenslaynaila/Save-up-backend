import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { sql } from '../../db';
import { SecurityQuestionSchema } from '../../types';

const SQL_GET_SECURITY_QUESTIONS = sql<Record<string, never>, SecurityQuestionSchema>(
  `SELECT id, question FROM security_questions`
);

export default async function(route: FastifyInstance) {
  route.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const securityQuestions = await SQL_GET_SECURITY_QUESTIONS({}).many();
    reply.send(securityQuestions);
  });
}