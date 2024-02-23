import { Request } from 'express';
import { UserRole } from '../types';

export function hasPermission(req: Request, userId: string, userRole: UserRole): boolean {
  if (userRole === UserRole.ADMIN || userRole === UserRole.MODERATOR) {
    return true;
  } else {
    const authenticatedUserId = req.user?.id;
    return authenticatedUserId === userId;
  }
}
