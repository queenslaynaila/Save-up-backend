import { FastifyInstance } from 'fastify';
import createSecurityAnswer from './createSecurityAnswer';

export default (fastify: FastifyInstance) => {

  createSecurityAnswer(fastify);
};
