import { Request } from 'express';
import { UserRole } from '../types';

export function hasPermission(req: Request, targetUserId: string): boolean {
  if (req.user!.role === UserRole.ADMIN || req.user!.role === UserRole.MODERATOR) {
    return true;
  } else {
    const loggedInUserId = req.user?.id;
    console.log( loggedInUserId!.toString() === targetUserId.toString())
    return loggedInUserId!.toString() === targetUserId.toString();
  }
}
