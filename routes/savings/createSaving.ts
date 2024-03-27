import { FastifyRequest, FastifyReply,FastifyInstance } from 'fastify';
import authMiddleware from '../../middleware/auth';
import { savingSchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';
import { savingInterface } from './index';
import { z } from 'zod';
import { hasPermission } from '../../middleware/hasPermission';
import  { validateRequest } from '../../middleware/validationMiddleware';

const SQL_CREATE_SAVING = sql<z.infer<typeof savingSchema>, savingInterface>(`
  INSERT INTO savings (id, user_id, description, category_id, amount, priority, target_at)
  SELECT COALESCE((SELECT MAX(id) FROM savings WHERE user_id = :user_id), 0) + 1,
  :user_id, :description, :category_id, :amount, :priority, :target_at
  RETURNING *
`);

export default async (fastify: FastifyInstance) => {
  fastify.post<{ Body: z.infer<typeof savingSchema> }>(
    '/',
    { preHandler:[ authMiddleware(),validateRequest(savingSchema) ]}, 
    async (req: FastifyRequest<{ Body: z.infer<typeof savingSchema> }>, reply: FastifyReply) => {
      const { user_id, description, category_id, amount, priority, target_at } = req.body;
      if (!hasPermission(req, user_id)) {
        throw new HttpError(403, 'Forbidden')
      }
      const newSaving = await SQL_CREATE_SAVING({
        user_id: user_id,
        description,
        category_id,
        amount,
        priority,
        target_at,
      }).one();
      return reply.send(newSaving);
    }
  );
};