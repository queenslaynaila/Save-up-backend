import { FastifyRequest, FastifyReply,FastifyInstance } from 'fastify';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';
import { HttpError } from '../../middleware/errorMiddleware';

const SQL_GET_TOTAL_TARGET_AMOUNT = sql<{ [key: string]: string },{ total_target_amount: number }>(`
    SELECT COALESCE(SUM(amount), 0) AS total_target_amount
    FROM savings
`);



export default (fastify: FastifyInstance) => {
  fastify.get<{ Querystring:{priority?: string;status?: string;category_id?: string;}}, { total_target_amount: number }>(
    '/total-target-amount', 
    { preHandler: authMiddleware() },
    async (req:FastifyRequest<{ Querystring:{priority?: string;status?: string;category_id?: string;}}>, reply:FastifyReply) => {
      const userId = req.user!.id;
      const filters: string[] = [];
      const filterArgs: Record<string, string> = {};
      const { priority, status, category_id } = req.query 
      const values: Record<string, number> = { userId };
  
      if (priority) {
        filterArgs.priority = priority;
        filters.push('priority = :priority');
      }
      if (status) {
        filterArgs.status = status;
        filters.push ('status = :status');
      }
      if (category_id) {
        filterArgs.category_id = category_id;
        filters.push ('category_id = :category_id')
      }
      const query = SQL_GET_TOTAL_TARGET_AMOUNT({});
      if (filters.length > 0) query.extend(`WHERE ${filters.join(' AND ')}`, filterArgs);
      query.extend('WHERE user_id = :userId', values);
      reply.send(await query.one( new HttpError(500, 'An error occurred while processing your request. Please try again later.')));
    }
  );
  
};
