import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload, Secret, VerifyErrors } from 'jsonwebtoken';
import { UserRole } from '../globalTypes';
import { HttpError } from './errorMiddleware';

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

export interface AuthMiddlewareOptions {
  roles?: UserRole[] | UserRole;
}

const ISSUER = 'saveup';

function authMiddleware(options: AuthMiddlewareOptions = {}) {
  const roles = options.roles || [];

  return (req: Request, _res: Response, next: NextFunction) => {
    const accessToken = req.headers.Authorization;

    if (!accessToken || typeof accessToken !== 'string') {
      throw new HttpError(401);
    }

    const accessTokenValue = accessToken.split(' ')[1];
    if (!accessTokenValue) {
      throw new HttpError(401);
    }

    const verifyOptions: jwt.VerifyOptions = {
      issuer: ISSUER
    };

    jwt.verify(
      accessTokenValue,
      process.env.JWT_SECRET as Secret,
      verifyOptions,
      (err: VerifyErrors | null, decoded: JwtPayload | string | undefined) => {
        if (err || !decoded) {
          throw new HttpError(401);
        }

        const { id, role, exp } = decoded as { id: number; role: UserRole; exp: number };

        if (typeof exp === 'number' && exp * 1000 <= Date.now()) {
          throw new HttpError(401);
        }

        const user: User = { id, role };
        if (roles.length > 0 && !roles.includes(user.role)) {
          throw new HttpError(403);
        }

        req.user = user;
        return next();
      }
    );
  };
}

export default authMiddleware;