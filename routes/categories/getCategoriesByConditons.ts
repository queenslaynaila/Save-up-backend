import { FastifyRequest, FastifyReply,FastifyInstance } from 'fastify';
import authMiddleware from '../../middleware/auth';
import { z } from 'zod';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';
import { CategorySchema } from '../../types';

const UUIDSCHEMA = z.string().uuid();
const SQL_GET_ALL_CATEGORIES = sql<Record<string, never>, CategorySchema>(
  `SELECT * FROM categories WHERE deleted_at IS NULL`
);

export default async (fastify: FastifyInstance) => {
  fastify.post<{ Params:{ user_id: string }}>(
    '/:user_id',
    { preHandler:authMiddleware()}, 
    async (req:FastifyRequest<{ Params: { user_id: string } }>,reply: FastifyReply) => {
      const { user_id: categoryIdentifier } = req.params;
      const isStandardUser = req.user?.role === 'User';
      const loggedInUserId = req.user!.id;
      const query = SQL_GET_ALL_CATEGORIES({});

      if (categoryIdentifier === 'me') {
        query.extend(`AND user_id = :loggedInUserId `, { loggedInUserId });
      } else if (categoryIdentifier === 'all') {
        if (isStandardUser) {
          throw new HttpError(403, 'Forbidden');
        }
      } else if (categoryIdentifier === 'system') {
        if (isStandardUser) {
          throw new HttpError(403, 'Forbidden');
        }
        query.extend(`AND user_id = 1`, {});
      } else if (UUIDSCHEMA.parse(categoryIdentifier)) { 
        if (isStandardUser && loggedInUserId.toString() !== categoryIdentifier.toString()) {
          throw new HttpError(403, 'Forbidden');
        }
        query.extend(`AND user_id = :categoryIdentifier`, { categoryIdentifier });
      } else {
        throw new HttpError(400, 'Bad request');
      }

      query.extend('LIMIT 15', {});
      const categories = await query.many();
      reply.send(categories);
    }
  );
};