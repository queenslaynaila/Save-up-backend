import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/auth';
import { convertToTitleCase, isValidValue } from '../../middleware/caseNormalization';
import { hasPermission } from '../../middleware/hasPermission';
import { sql } from '../../db';
import { UserSchema } from './index';
import { ID_SCHEMA } from '../../types/index';

const SQL_GET_ALL_USERS = sql<Record<string, never>, UserSchema>(`
  SELECT id, first_name, last_name, role, created_at FROM users
`);
const ACCEPTED_ROLES = ['User', 'Admin', 'Moderator'];

export default (fastify: FastifyInstance) => {
  fastify.get<{ Params: { userId: string }, Querystring: { role?: string } }>(
    '/:userId',
    { preHandler: authMiddleware() },
    async (request: FastifyRequest<{ Params: { userId: string }, Querystring: { role?: string } }>, reply: FastifyReply) => {
      const { userId } = request.params;
      const { role } = request.query;
      const filters: string[] = [];
      const filterArgs: Record<string, string | number> = {};
      const isStandardUser = request.user?.role === 'User';
      const convertedRole = role ? convertToTitleCase(role) : '';

      if (userId === 'me') {
        filterArgs.loggedInUserId = request.user!.id;
        filters.push(`id = :loggedInUserId`);
      } else if (userId === 'all') {
        if (isStandardUser) {
          throw new HttpError(403, 'Forbidden');
        }
      } else if (ID_SCHEMA.safeParse(parseInt(userId)).success) {
        if (!hasPermission(request, parseInt(userId))) {
          throw new HttpError(403, 'Forbidden');
        }
        filterArgs.userId = userId;
        filters.push(`id = :userId`);
      } else {
        throw new HttpError(400, 'Bad request');
      }

      if (convertedRole && isValidValue(convertedRole, ACCEPTED_ROLES)) {
        filterArgs.role = convertedRole;
        filters.push(`role = :role`);
      }

      const query = SQL_GET_ALL_USERS({});
      if (filters.length > 0) query.extend(`WHERE ${filters.join(' AND ')}`, filterArgs);
      query.extend('LIMIT 15', {});
      const users = await query.many();
      reply.send(users);
    });
};
