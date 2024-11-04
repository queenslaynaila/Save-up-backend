import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload, Secret, VerifyErrors } from 'jsonwebtoken';
import { UserRole } from '../globalTypes';
import { HttpError } from './errorMiddleware';
import { ISSUER } from './generatetoken';

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

        const { user, exp } = decoded as { user: User, exp: number };

        if (typeof exp === 'number' && exp * 1000 <= Date.now()) {
          return next(new HttpError(401));
        }

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
