import { FastifyInstance, FastifyRequest,FastifyReply } from 'fastify';
import { ID_SCHEMA } from '../../types'; 
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth'; 

const SQL_DELETE_CATEGORY = sql<{ id: number; user_id: number }, Record<string, never>>(`
  DELETE FROM categories
  WHERE id = :id AND user_id = :user_id
`);

export default  async (fastify: FastifyInstance) => {
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
      const id = parseInt(request.params.id);
      const userId = request.user!.id; 
      await SQL_DELETE_CATEGORY({ id, user_id: userId }).exec();
      reply.code(204).send(); 
    }
  );
};

