import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload, Secret, VerifyErrors } from 'jsonwebtoken';
import { UserRole } from '../globalTypes';
import { HttpError } from './errorMiddleware';
import { verifyTokenExpiration } from './generatetoken';

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

    if (!accessToken) {
      throw new HttpError(401);
    }

    const accessTokenValue = accessToken.split(' ')[1];
    if (!accessTokenValue) {
      throw new HttpError(401);
    }

    const isExpired = verifyTokenExpiration(accessTokenValue);
    if (isExpired) {
      throw new HttpError(401);
    }

    const verifyOptions: jwt.VerifyOptions = {
      issuer: 'saveup'
    };

    jwt.verify(
      accessTokenValue,
      process.env.JWT_SECRET as Secret,
      verifyOptions,
      (err: VerifyErrors | null, decoded: JwtPayload | string | undefined) => {
        if (err || !decoded) {
          throw new HttpError(401);
        }

        const user = decoded as User;
        if (roles.length && !roles.includes(user.role)) {
          throw new HttpError(403);
        }

        req.user = user;
        return next();
      }
    );
  };
}

export default authMiddleware;
