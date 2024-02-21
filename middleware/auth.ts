import { NextFunction, Request, Response } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import { User, UserRole } from '../types';
import { HttpError } from './errorMiddleware';

declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
  }
}

interface AuthMiddlewareOptions {
  roles?: UserRole[] | UserRole;
}

function authMiddleware(options: AuthMiddlewareOptions = {}) {
  const roles = options.roles || [];

  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization'];

    if (!token) {
      return res.status(401).json({ message: 'Token does not exist. Login first' });
    }

    const tokenValue = token.split(' ')[1];

    jwt.verify(tokenValue, process.env.JWT_SECRET as Secret, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token, please log in again' });
      }

      const user = decoded as User;
      if (roles.length && !roles.includes(user.role)) {
        throw new HttpError(403, 'You do not have permission to access this resource');
      }

      req.user = user;
      next();
    });
  };
}

export default authMiddleware;
