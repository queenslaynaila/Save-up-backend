import { Request } from 'express';
import { UserRole } from '../globalTypes';

export function hasPermission(req: Request, targetUserId:number): boolean {
  if (req.user!.role === UserRole.ADMIN || req.user!.role === UserRole.MODERATOR) {
    return true;
  } else {
    const loggedInUserId = req.user?.id;
    return loggedInUserId!.toString() === targetUserId.toString();
  }
}
