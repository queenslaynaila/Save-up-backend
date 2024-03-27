import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import authMiddleware from '../../middleware/auth';
import { HttpError } from '../../middleware/errorMiddleware';
import { savingInterface } from './index';
import { sql } from '../../db';
import { ID_SCHEMA, UserRole } from '../../types';
import { validateRequest } from '../../middleware/validationMiddleware';

const SQL_GET_SAVING_BY_ID = sql<{ id: number; userId?: number }, savingInterface>(`
    SELECT * FROM savings WHERE id = :id
`);

export default (fastify: FastifyInstance) => {
  fastify.get<{ Params: { savingId: string } }>(
    '/records/:savingId', 
    { preHandler: [authMiddleware(),validateRequest(ID_SCHEMA)]}, 
    async (req: FastifyRequest<{ Params: { savingId: string } }>, reply: FastifyReply) => {
      const savingId = parseInt(req.params.savingId);
      const loggedInUserId = req.user!.id;
      const userRole = req.user!.role;

      const query = SQL_GET_SAVING_BY_ID({ id: savingId });
      if (userRole !== UserRole.ADMIN) {
        query.extend('AND user_id = :userId', { userId: loggedInUserId });
      }
      const saving = await query.one(new HttpError(404, 'Not found'));
      reply.send(saving);
    });
};
