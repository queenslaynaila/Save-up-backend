import { NextFunction, Request, Response } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import { UserRole } from '../globalTypes';
import { HttpError } from './errorMiddleware';
import { generateToken, verifyTokenExpiration } from './generatetoken';

export type User = {
  id: number;
  role: UserRole;
  step?: number;
}
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
    const accessToken = req.headers['authorization-token'] as string;
    const refreshToken = req.headers['refresh-token'] as string;

    if (!accessToken || !refreshToken) {
      throw new HttpError(401);
    }

    if (accessToken) {
      const accessTokenValue = accessToken.split(' ')[1];
      const isExpired = verifyTokenExpiration(accessTokenValue);

      if (isExpired && refreshToken) {
        const refreshTokenValue = refreshToken.split(' ')[1];
        const decodedRefreshToken = jwt.verify(refreshTokenValue, process.env.JWT_SECRET as Secret);
        const user = decodedRefreshToken as User;
        const newAccessToken = generateToken(user.id, user.role, '1d');
        const newRefreshToken = generateToken(user.id, user.role, '7d');
        res.setHeader('authorization-token', newAccessToken);
        res.setHeader('refresh-token', newRefreshToken);
        if (roles.length && !roles.includes(user.role)) {
          throw new HttpError(403);
        }
        req.user = user;
        return next();
      }

      const decodedAccessToken = jwt.verify(accessTokenValue, process.env.JWT_SECRET as Secret);
      const user = decodedAccessToken as User;

      if (roles.length && !roles.includes(user.role)) {
        throw new HttpError(403);
      }
      req.user = user;
      return next();
    }
  };
}

export default authMiddleware;
