import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt, { Secret, JwtPayload } from 'jsonwebtoken';
import { sql } from './db';
import HttpError from './httpError';
import Config from './config';
import { 
  AuthenticatedUser, 
  PinResetState, 
  Role
} from './routes/users/schema';
import logger from './logger';

const ADMIN_LIKE_ROLES: Role[] = ['Admin', 'Moderator'];

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthenticatedUser;
    resetState?: PinResetState;
  }
}

export function generateToken(
  id: number,
  expiresIn: string,
  roleOrStep: Role | number
): string {
  const payload: { id: number; role?: Role; step?: number } = { id };

  if (typeof roleOrStep === "number") {
    payload.step = roleOrStep;
  } else {
    payload.role = roleOrStep;
  }

  return jwt.sign(
    payload,
    Config.JWT_SECRET as Secret,
    {
      expiresIn,
      issuer: Config.JWT_ISSUER
    }
  );
}

function validateAndDecodeJwt(headerValue: string): JwtPayload {
  const parts = headerValue.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new HttpError(400);
  }
  const token = parts[1];

  const decoded = jwt.verify(token, Config.JWT_SECRET as Secret) as JwtPayload;
  if (!decoded ||
      !decoded.id ||
      (decoded.exp && decoded.exp * 1000 <= Date.now())
  ) {
    throw new HttpError(401);
  }

  return decoded;
}

export function decodeEntityOrUserId(
  req: Request<{ entity_id?: number | "me"; user_id?: number | "me" }>,
  isOwnerOrAdminMod: boolean = false
): number {
  const entityId = req.params.user_id ?? req.params.entity_id;

  if (entityId === "me" || Number(entityId) === req.user!.id) {
    return req.user!.id; 
  }
  
  if (isOwnerOrAdminMod && ADMIN_LIKE_ROLES.includes(req.user!.role)) {
    return Number(entityId);
  }

  throw new HttpError(403);
}

export function authMiddleware(auth: true | Role | Role[] = true) {
  return function (req: Request, _res: Response, next: NextFunction) {
    if (!req.headers.authorization) {
      throw new HttpError(401);
    }

    const decoded = validateAndDecodeJwt(req.headers.authorization);
    if (!decoded.id || !decoded.role) {
      throw new HttpError(400);
    }

    req.user = { id: decoded.id, role: decoded.role };

    if (auth !== true) {
      const allowedRoles = Array.isArray(auth) ? auth : [auth];
      if (!allowedRoles.includes(req.user.role)) {
        throw new HttpError(403);
      }
    }

    next();
  };
}


export function checkResetTokenValidity(requiredStep: number) {
  return function(req: Request, _res: Response, next: NextFunction) {
    const resetToken = req.headers.reset as string;
    const decoded = validateAndDecodeJwt(resetToken);

    if (!decoded.id || !decoded.step) {
      throw new HttpError(401);
    }

    req.resetState = { userId: decoded.id, step: decoded.step };

    if (req.resetState.step !== requiredStep) {
      throw new HttpError(403);
    }

    next();
  };
}

const SQL_GET_PIN = sql<{user_id: number}, {pin: string}>(`
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

const SQL_GET_GROUP_MEMBERSHIP_STATUS = sql<{
  entity_id: number;
  user_id: number;
}, {
  is_admin_member: boolean;
  is_member: boolean;
}>(`
  SELECT 
    EXISTS (
      SELECT 1 FROM group_members 
      WHERE user_id = :user_id 
        AND group_id = :entity_id
        AND is_active = TRUE
    ) AS is_member,
    EXISTS (
      SELECT 1 FROM group_admins
      WHERE group_id = :entity_id
        AND user_id = :user_id
        AND election_id = (
          SELECT MAX(xid) FROM elections 
          WHERE group_id = :entity_id 
            AND status = 'Closed'
        )
    ) AS is_admin_member
`);

interface GroupMembershipOptions {
  isOwnerOrAdminMod?: boolean;
  requiresGrpAdmin?: boolean;
}

export default function verifyGroupMembership({
  isOwnerOrAdminMod = false,
  requiresGrpAdmin = false
}: GroupMembershipOptions = {}) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const entityId = Number(req.params.entity_id ?? req.params.group_id)
    const userId = req.user!.id

    if (entityId === userId) {
      return next()
    }

    if (isOwnerOrAdminMod && ADMIN_LIKE_ROLES.includes(req.user!.role)) {
      return next();
    }
    
    const { is_admin_member, is_member } = await SQL_GET_GROUP_MEMBERSHIP_STATUS({
      entity_id: entityId,
      user_id: userId 
    }).one()

    if (!is_member) {
      throw new HttpError(403)
    }

    if (req.params.member_id === 'me') {
      req.params.member_id = req.user!.id.toString()
    }

    const isRequestingOtherMember = req.params.member_id && 
                                  userId !== parseInt(req.params.member_id)

    if (isRequestingOtherMember && !is_admin_member) {
      throw new HttpError(403)
    }

    if (requiresGrpAdmin && !is_admin_member) {
      throw new HttpError(403)
    }

    next()
  }
}