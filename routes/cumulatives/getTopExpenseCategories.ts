import { FastifyRequest, FastifyReply,FastifyInstance } from 'fastify';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';

interface TopExpenditureCategory {
  total_expense: number;
}

const SQL_GET_TOP_EXPENDITURE_CATEGORIES = sql<{ userId:number }, TopExpenditureCategory[]>(`
  SELECT e.category_id,c.name AS category_name,
  COALESCE(SUM(e.amount), 0) AS total_expense FROM expenses e
  JOIN categories c ON e.category_id = c.id
  WHERE  e.user_id = :userId
  GROUP BY e.category_id, c.name
  ORDER BY total_expense DESC
`);

export default async function (fastify: FastifyInstance) {
  fastify.get(
    '/top-expenditure-categories',
    { preHandler: authMiddleware() },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const userId = req.user!.id;
      const result = await SQL_GET_TOP_EXPENDITURE_CATEGORIES({ userId }).many();
      reply.send(result);
    }
  );
}