import { FastifyRequest, FastifyReply,FastifyInstance } from 'fastify';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';
import { HttpError } from '../../middleware/errorMiddleware';

interface TotalExpensesQuery {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
}

interface TotalExpensesResponse {
  total_expenses: number;
}


const SQL_GET_TOTAL_EXPENSES = sql<{ userId: number }, { total_expenses: number }>(`
      SELECT COALESCE(SUM(amount), 0) AS total_expenses
      FROM expenses
      WHERE user_id = :userId`);

export default (fastify: FastifyInstance) => {
  fastify.get<{ Querystring: TotalExpensesQuery }, TotalExpensesResponse>(
    '/total-expenses', 
    { preHandler: authMiddleware() },
    async (req:FastifyRequest<{ Querystring: TotalExpensesQuery }>, reply:FastifyReply) => {
      const userId = req.user!.id;
      const { startDate, endDate, categoryId } = req.query;
      const filters: string[] = [];
      const filterArgs: Record<string, string> = {};
      if (startDate) {
        filterArgs.startDate = startDate;
        filters.push(`date >= :startDate`);
      }
      if (endDate) {
        filterArgs.endDate = endDate;
        filters.push(`date <= :endDate`);
      }
      if (categoryId){
        filterArgs.categoryId = categoryId;
        filters.push(`category_id = :categoryId`);
      }

      const query = SQL_GET_TOTAL_EXPENSES({userId });
      if (filters.length > 0) query.extend(`AND ${filters.join(' AND ')}`, filterArgs);
      query.extend('LIMIT 15', {});
      reply.send(await query.one( new HttpError(500, 'An error occurred while processing your request. Please try again later.')));

    });
};
