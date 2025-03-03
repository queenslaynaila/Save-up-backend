import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt, { Secret, VerifyErrors, JwtPayload } from 'jsonwebtoken';
import { z } from 'zod';
import { sql } from './db';
import HttpError from './httpError';

export const USER_ROLE_ENUM = z.enum(['Admin', 'Standard', 'Moderator']);
type UserRole = z.infer<typeof USER_ROLE_ENUM>;

export interface AuthMiddlewareOptions {
  roles?: UserRole[] | UserRole;
  allowModeratorAccess?: boolean;
}

interface User {
  id: number;
  role: UserRole;
  step?: number;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
  }
}


function generateToken(id: number, role: UserRole, expiresIn: string): string {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET as Secret,
    { expiresIn, issuer: process.env.ISSUER }
  );
}

export default function authMiddleware(options: AuthMiddlewareOptions = {}) {
  const roles = Array.isArray(options.roles) ? options.roles : options.roles ? [options.roles] : [];
  const allowModeratorAccess = options.allowModeratorAccess || false;

  return (req: Request, _res: Response, next: NextFunction) => {
    const accessToken = req.headers.authorization;

    if (!accessToken || typeof accessToken !== 'string') {
      throw new HttpError(401);
    }

    const accessTokenValue = accessToken.split(' ')[1];
    if (!accessTokenValue) {
      throw new HttpError(401);
    }

    const verifyOptions: jwt.VerifyOptions = {
      issuer: process.env.ISSUER,
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

        console.log(`User ${id} authenticated with role ${role}`);
        if (roles.length > 0 && !roles.includes(user.role)) {
          throw new HttpError(403);
        }
        req.user = user;

        if (req.params.user_id === 'me') {
          req.params.user_id = user.id.toString();
        }

        if (req.params.user_id) {
          const requestedUserId = parseInt(req.params.user_id, 10);
        
          if (requestedUserId !== user.id) {
            if (!allowModeratorAccess || (user.role !== 'Admin' && user.role !== 'Moderator')) {
              throw new HttpError(403);
            }
          }
        }

        console.log(`User ${id} authenticated with role ${role} calling next`);

        next();
      }
    );
  };
}

/**
 * Middleware to verify and decode a reset token from the request headers.
 * Attaches the decoded user to the request object.
 */
function authenticateResetToken(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.reset as string;
  if (!token) {
    throw new HttpError(403);
  }

  const resetTokenValue = token.split(' ')[1];
  if (!resetTokenValue) {
    throw new HttpError(403);
  }

  jwt.verify(resetTokenValue, process.env.JWT_SECRET as Secret, (err, decodedResetToken) => {
    if (err) {
      throw new HttpError(403);
    }

    const user = decodedResetToken as User;
    req.user = user;
    next();
  });
}

/**
 * Middleware to check the progression of the reset steps.
 * Ensures the user is on the correct step before proceeding and has not skipped any.
 */
function checkResetStepProgression(requiredStep: number) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const step = req.user?.step;
    if (step !== requiredStep) {
      throw new HttpError(422);
    }
    next();
  };
}

const SQL_GET_PIN = sql<{ user_id: number }, { pin: string }>(`
  SELECT pin
  FROM users
  WHERE id = :user_id
`);

async function verifyPin(req: Request, res: Response, next: NextFunction) {
  const user_id = req.user!.id;

  const { pin: pinHash } = await SQL_GET_PIN({
    user_id
  }).one();

  if (!await bcrypt.compare(req.body.pin, pinHash)) {
    throw new HttpError(401);
  }
  console.log("✅ Authentication passed, calling next() now...");
next();
console.log("❌ This should never appear if next() worked.");

}

export { authenticateResetToken, checkResetStepProgression, generateToken, verifyPin };
