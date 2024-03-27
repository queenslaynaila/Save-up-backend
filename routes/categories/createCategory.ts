import { FastifyRequest, FastifyReply,FastifyInstance } from 'fastify';
import authMiddleware from '../../middleware/auth';
import { CreateCategorySchema, CategorySchema } from '../../types';
import  { validateRequest } from '../../middleware/validationMiddleware';
import { sql } from '../../db';

type CreateCategory ={
  user_id: number
  name: string
  description: string
}

const SQL_CREATE_CATEGORY = sql<CreateCategory, CategorySchema>(`
  INSERT INTO categories (id, user_id, name, description)
  SELECT COALESCE((SELECT MAX(id) FROM categories WHERE user_id = :user_id), 0) + 1,
        :user_id, :name, :description
  RETURNING id, user_id, name, description, created_at;
`);


export default async (fastify: FastifyInstance) => {
  fastify.post<{ Body:CreateCategory }>(
    '/',
    { preHandler:[ validateRequest(CreateCategorySchema),authMiddleware() ]}, 
    async (req: FastifyRequest<{ Body: CreateCategory }>, reply: FastifyReply) => {
      const { user_id, name, description } = req.body;
      const categoryResult = await SQL_CREATE_CATEGORY({ user_id, name, description }).one();
      return reply.send(categoryResult);
    }
  );
};