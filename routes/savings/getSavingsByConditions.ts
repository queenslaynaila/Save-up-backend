import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { sql } from '../../db';
import { savingInterface } from './index';
import authMiddleware from '../../middleware/auth';
import { convertToTitleCase, isValidValue } from '../../middleware/caseNormalization';
import { HttpError } from '../../middleware/errorMiddleware';
import {ID_SCHEMA}  from '../../types/index';

const ACCEPTED_STATUS_VALUES = ['In Progress', 'Dormant', 'Completed'];
const ACCEPTED_PRIORITY_VALUES = ['High', 'Intermediate', 'Low'];

const SQL_GET_SAVINGS = sql<Record<string, never>, savingInterface>(
  `SELECT *FROM savings WHERE deleted_at IS NULL`
);


export default (fastify: FastifyInstance) => {
  fastify.get<{ Params: { savingsIdentifier: string }, Querystring: { category_id?: string; priority?: string; status?: string; start_at?: string; completed_at?: string  } }>(
    '/:savingsIdentifier',
    { preHandler: authMiddleware() },
    async (request: FastifyRequest<{ Params: { savingsIdentifier: string }, Querystring: { category_id?: string; priority?: string; status?: string; start_at?: string; completed_at?: string  } }>, reply: FastifyReply) => {
      const { savingsIdentifier } = request.params;
      const { category_id, priority, status, start_at, completed_at } = request.query;

      const filters: string[] = [];
      const filterArgs: Record<string, string> = {};
      const loggedInUserId = request.user!.id;
      const convertedStatus = status ? convertToTitleCase(status) : undefined;
      const convertedPriority = priority ? convertToTitleCase(priority) : undefined;
      const isStandardUser = request.user?.role === 'User';

      if (savingsIdentifier === 'me') {
        filterArgs.loggedInUserId = loggedInUserId.toString();
        filters.push(`user_id = :loggedInUserId`);
      } else if (savingsIdentifier === 'all') {
        if (isStandardUser) {
          throw new HttpError(403, 'Forbidden');
        }
      } else if (ID_SCHEMA.safeParse(parseInt(savingsIdentifier)).success) {
        if (isStandardUser && request.user!.id !== parseInt(savingsIdentifier)) {
          throw new HttpError(403, 'Forbidden');
        }
        filterArgs.savingsIdentifier = savingsIdentifier;
        filters.push(`user_id = :savingsIdentifier`);
      } else {
        throw new HttpError(400, 'Bad request');
      }

      if (category_id) {
        filterArgs.category_id = category_id;
        filters.push(`category_id = :category_id`);
      }

      if (start_at) {
        filterArgs.start_at = start_at;
        filters.push(`start_at = :start_at`);
      }

      if (completed_at) {
        filterArgs.completed_at = completed_at;
        filters.push(`completed_at = :completed_at`);
      }

      if (convertedPriority && isValidValue(convertedPriority, ACCEPTED_PRIORITY_VALUES)) {
        filterArgs.priority = convertedPriority;
        filters.push(`priority = :priority`);
      }

      if (convertedStatus && isValidValue(convertedStatus, ACCEPTED_STATUS_VALUES)) {
        filterArgs.status = convertedStatus;
        filters.push(`status = :status`);
      }

      const query = SQL_GET_SAVINGS({});
      if (filters.length > 0) query.extend(`AND ${filters.join(' AND ')}`, filterArgs);
      query.extend('LIMIT 15', {});
      const savings = await query.many();
      reply.send(savings);
    }
  );
};