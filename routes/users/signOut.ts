import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import authMiddleware from '../../middleware/auth';

export default (fastify: FastifyInstance) => {
  fastify.post('/signout', { preHandler: authMiddleware() }, async (req: FastifyRequest, reply: FastifyReply) => {
    reply.removeHeader('X-Auth-Token');
    reply.send({ message: 'Logout successful' });
  });
};
