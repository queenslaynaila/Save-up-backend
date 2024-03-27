import { FastifyRequest } from 'fastify';
import { UserRole } from '../types';

export function hasPermission(req: FastifyRequest, targetUserId:number): boolean {
  if (req.user!.role === UserRole.ADMIN || req.user!.role === UserRole.MODERATOR) {
    return true;
  } else {
    const loggedInUserId = req.user?.id;
    return loggedInUserId!.toString() === targetUserId.toString();
  }
}
