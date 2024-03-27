import { FastifyRequest, FastifyReply,FastifyInstance } from 'fastify';
import { sql } from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
import { UserSchema } from '../../routes/users/index';
import authMiddleware from '../../middleware/auth';
import { convertToTitleCase } from '../../middleware/caseNormalization';
import { UserRole } from '../../types';

const VALID_ROLES = ['Admin', 'User', 'Moderator'];

const SQL_UPDATE_ROLE = sql<{ roleToUpdate: string; id: string }, UserSchema>(`
  UPDATE users 
  SET role = :roleToUpdate 
  WHERE id = :id 
  RETURNING id, first_name, last_name, role, created_at
`);

export default async (fastify: FastifyInstance) => {
  fastify.patch<
  { Params: { roleToUpdate: string; id: string }; Body: never }, 
  UserSchema, 
  Record<string, never>
  >(
    '/:roleToUpdate/:id',
    {
      preHandler: [authMiddleware({ roles: [UserRole.ADMIN] })],
    },
    async (req: FastifyRequest<{ Params: { roleToUpdate: string; id: string } }>, reply:FastifyReply) => {
      const { roleToUpdate, id } = req.params;
      const formattedRole = convertToTitleCase(roleToUpdate);
      if (!VALID_ROLES.includes(formattedRole)) {
        throw new HttpError(400, 'Invalid role.');
      }
      const result = await SQL_UPDATE_ROLE({ roleToUpdate: formattedRole, id })
        .one(new HttpError(404, 'User with given ID not found.'));
      reply.send(result);
    } 
  )};
