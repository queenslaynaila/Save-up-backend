import { FastifyRequest, FastifyReply,FastifyInstance } from 'fastify';
import authMiddleware from '../../middleware/auth';
import { HttpError } from '../../middleware/errorMiddleware';
import { ID_SCHEMA, ContributionSchema, UserRole } from '../../types';
import { sql } from '../../db';
import  { validateRequest } from '../../middleware/validationMiddleware';


const SQL_GET_CONTRIBUTION_BY_ID = (query: string) =>sql<{ id: number }, ContributionSchema>(query);

export default async (fastify: FastifyInstance) => {
  fastify.post<{ Params:{ id: string }}>(
    '/:user_id',
    { preHandler:[authMiddleware(),validateRequest(ID_SCHEMA)]}, 
    async (req:FastifyRequest<{ Params: { id: string } }>,reply: FastifyReply) => {
      const contributionsId = parseInt(req.params.id);
      const userId = req.user!.id;
      const userRole = req.user!.role;

      let query = 'SELECT * FROM contributions WHERE id = :id ';
      const values: { id:number; userId?:number } = { id: contributionsId };
      if (userRole !== UserRole.ADMIN) {
        query += `AND saving_id IN (SELECT id FROM savings WHERE user_id = :userId)`;
        values.userId = userId;
      }
      const result = await SQL_GET_CONTRIBUTION_BY_ID(query)(values).one(
        new HttpError(404, 'Unable to complete the request')
      );
      return reply.send(result);
    }
  );
};