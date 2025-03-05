import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt, { Secret, VerifyErrors, JwtPayload } from 'jsonwebtoken';
import { z } from 'zod';
import { sql } from '../db';
import HttpError from '../httpError';
import Config from '../config';

const USER_ROLE_ENUM = z.enum(['Admin', 'Standard', 'Moderator']);
export type UserRole = z.infer<typeof USER_ROLE_ENUM>;

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

function extractToken(headerValue?: string): string {
  if (!headerValue) {
    throw new HttpError(401);
  }

  const [bearer, token] = headerValue.split(' ');
  if (bearer !== 'Bearer' || !token) {
    throw new HttpError(401);
  }

  return token;
}

function verifyJwtToken(token: string): User {
  const decoded = jwt.verify(token, Config.JWT_SECRET as Secret) as JwtPayload;
  if (!decoded || 
      (decoded.exp && 
        decoded.exp * 1000 <= Date.now())){
     throw new HttpError(401);
  }
  return { id: decoded.id, role: decoded.role };
}

export async function authMiddleware(options: AuthMiddlewareOptions = {}) {
  const roles = Array.isArray(options.roles) ? options.roles : options.roles ? [options.roles] : [];
  const allowModeratorAccess = options.allowModeratorAccess || false;

  return function (req: Request, _res: Response, next: NextFunction) {
    req.user = verifyJwtToken(extractToken(req.headers.authorization));

    if (roles.length && !roles.includes(req.user.role)){
       throw new HttpError(403);
    }

    if (req.params.user_id === 'me'){
      req.params.user_id = req.user.id.toString();
    }

    if (req.params.user_id && parseInt(req.params.user_id, 10) !== req.user.id) {
      if (!allowModeratorAccess || !['Admin', 'Moderator'].includes(req.user.role)) {
        throw new HttpError(403);
      }
    }

    next();
  };
}

export async function authenticateResetToken(req: Request, _res: Response, next: NextFunction) {
  req.user = verifyJwtToken(extractToken(req.headers.reset));
  next();
}

export async function checkResetStepProgression(requiredStep: number) {
  return function (req: Request, _res: Response, next: NextFunction) {
    if (req.user?.step !== requiredStep){
       throw new HttpError(403);
    }
    next();
  };
}

const SQL_GET_PIN = sql<{ user_id: number }, { pin: string }>(`
  SELECT pin FROM users WHERE id = :user_id
`);

export async function verifyPin(req: Request, _res: Response, next: NextFunction) {
  const { pin: hashedPin } = await SQL_GET_PIN({ 
    user_id: req.user!.id 
  }).one();
  if (!await bcrypt.compare(req.body.pin, hashedPin)){
    throw new HttpError(401);
  }
  next();
};