import { FastifyInstance } from 'fastify';
import getAllSecurityQuestions from './getAllSecurityQuestions';

export default (fastify: FastifyInstance) => {
  getAllSecurityQuestions(fastify);
};
