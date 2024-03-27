import { FastifyRequest, FastifyReply,FastifyInstance } from 'fastify';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';
import { HttpError } from '../../middleware/errorMiddleware';

const SQL_GET_TOTAL_CONTRIBUTIONS = sql<{ userId: number }, { total_contributed_amount: number }>(`
    SELECT COALESCE(SUM(c.amount), 0) AS total_contributed_amount
    FROM contributions c
    JOIN savings s ON c.saving_id = s.id
    WHERE s.user_id = :userId
`);

export default async function (fastify: FastifyInstance) {
  fastify.get<{ Querystring: { startDate?: string; endDate?: string } }>(
    '/total-contributions',
    { preHandler: authMiddleware() },
    async (req: FastifyRequest<{ Querystring: { startDate?: string; endDate?: string } }>, reply: FastifyReply) => {
      const userId = req.user!.id;
      const { startDate, endDate } = req.query;
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
      const query = SQL_GET_TOTAL_CONTRIBUTIONS({ userId });
      if (filters.length > 0) query.extend(`AND ${filters.join(' AND ')}`, filterArgs);
      query.extend('LIMIT 15', {});
      const result = await query.one(new HttpError(404, 'Unable to complete the request'));
      reply.send(result);
    }
  );
}