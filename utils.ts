import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt, { Secret,JwtPayload } from 'jsonwebtoken';
import { z } from 'zod';
import { sql } from './db';
import HttpError from './httpError';
import Config from './config';
import { AuthenticatedUser, UserRole } from './routes/users/schema';

export interface AuthMiddlewareOptions {
  roles?: UserRole[] | UserRole;
  allowModeratorAccess?: boolean;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?:AuthenticatedUser;
  }
}

function extractAndVerifyJwtToken(headerValue?: string): AuthenticatedUser {
  if (!headerValue) {
    throw new HttpError(401);
  }

  const [bearer, token] = headerValue.split(' ');
  if (bearer !== 'Bearer' || !token) {
    throw new HttpError(401);
  }

  const decoded = jwt.verify(token, Config.JWT_SECRET as Secret) as JwtPayload;

  if (!decoded ||
      !decoded.id ||
      !decoded.role ||
      (decoded.exp && decoded.exp * 1000 <= Date.now())
    ) {
    throw new HttpError(401);
  }

  return { id: decoded.id, role: decoded.role, step: decoded.step };
}

export function authMiddleware(options: AuthMiddlewareOptions = {}) {
  const roles = Array.isArray(options.roles)
    ? options.roles
    : options.roles
      ? [options.roles]
      : [];
  const allowModeratorAccess = options.allowModeratorAccess || false;

  return function(req: Request, _res: Response, next: NextFunction) {
    req.user = extractAndVerifyJwtToken(req.headers.authorization);

    if (roles.length && !roles.includes(req.user.role)) {
      throw new HttpError(403);
    }

    if (req.params.user_id === 'me') {
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

export function authenticateResetTokenAndCheckStep(requiredStep: number) {
  const resetStepValidator = function (req: Request, _res: Response, next: NextFunction) {
    req.user = extractAndVerifyJwtToken(req.headers.reset as string);

    if (req.user.step === undefined) {
      throw new HttpError(401);
    }

    if (req.user!.step !== requiredStep) {
      throw new HttpError(403);
    }

    next();
  };

  return resetStepValidator;
}
const SQL_GET_PIN = sql<{ user_id: number }, { pin: string }>(`
  SELECT pin 
  FROM users 
  WHERE id = :user_id
`);

export async function verifyPin(req: Request, _res: Response, next: NextFunction) {
  const { pin: hashedPin } = await SQL_GET_PIN({
    user_id: req.user!.id
  }).one();

  if (!await bcrypt.compare(req.body.pin, hashedPin)) {
    throw new HttpError(401);
  }
  next();
}

const SQL_CHECK_GROUP_MEMBERSHIP = sql<{
  group_id: number;
  user_id: number;
  allow_admin_access: boolean;
}, Record<string, never>>(`
  SELECT check_grp_membership(
    :group_id,
    :user_id,
    :allow_admin_access
  )
`);

export default function verifyGroupMembership(allowAdminsAndModerators = false) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const groupId = Number(req.params.group_id) ||
                   Number(req.body.group_id) ||
                   Number(req.query.group_id);

    if (!groupId) {
      return next();
    }

    await SQL_CHECK_GROUP_MEMBERSHIP({
      group_id: groupId,
      user_id: req.user!.id,
      allow_admin_access: allowAdminsAndModerators
    }).exec()
      .catch((err) => {
        if (err.code === 'P0001') {
          throw new HttpError(403);
        }
        throw err;
      });

    next();
  };
}