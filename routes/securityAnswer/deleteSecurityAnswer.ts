import { FastifyInstance, FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { ID_SCHEMA } from '../../types'; 
import authMiddleware from '../../middleware/auth'; 
import { sql } from '../../db';

const SQL_DELETE_SECURITY_ANSWER = sql<{ id: number; user_id: number }, Record<string, never>>(`
  DELETE FROM security_answers WHERE id = :securityAnswerId AND user_id = :userId
`);

const deleteSecurityAnswerRoute: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.delete<{ Params: { id: string } }, { message: string }>(
    '/:id',
    {
      preHandler: [authMiddleware()],
      schema: {
        params: {
          id: ID_SCHEMA, 
        },
      },
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const securityAnswerId = parseInt(request.params.id);
      const loggedInUserId = request.user!.id; 
      await SQL_DELETE_SECURITY_ANSWER({ id: securityAnswerId, user_id: loggedInUserId }).exec();
      reply.code(204).send(); 
    }
  );
};

export default deleteSecurityAnswerRoute;

