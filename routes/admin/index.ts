import  { FastifyInstance } from 'fastify';
import createAdmin from './createAdmin';
import updateUserRole from './updateUserRole';

export default async function adminRoutes (fastify: FastifyInstance) {
  createAdmin(fastify);
  updateUserRole(fastify);
}

