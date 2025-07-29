import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { sql } from './db';
import HttpError from './httpError';
import Config from './config';
import {
  AuthenticatedUser,
  PinResetState,
  Role
} from './routes/users/schema';

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthenticatedUser;
    resetState?: PinResetState;
  }
}

const ADMIN_LIKE_ROLES: Role[] = ['Admin', 'Moderator'];

const SQL_GET_ENTITY_TYPE = sql<{
  entity_id: number;
}, {
  entity_type: 'Group' | 'User'
}>(`
  SELECT entity_type 
  FROM entities 
  WHERE id = :entity_id
`);

const SQL_GET_USER_PIN = sql<
{ user_id: number },
{ pin: string }
>(`
  SELECT pin 
  FROM users 
  WHERE id = :user_id
`);

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

export function generateToken(
  userId: number,
  expiresIn: string,
  roleOrStep: Role | number,
  isAccessToken = false
): string {
  const payload: { id: number; role?: Role; step?: number } = { id: userId };

  if (typeof roleOrStep === 'number') {
    payload.step = roleOrStep;
  } else {
    payload.role = roleOrStep;
  }

  const secret = isAccessToken
    ? Config.JWT_SECRET
    : Config.JWT_REFRESH_SECRET;

  return jwt.sign(payload, secret, {
    expiresIn,
    issuer: Config.JWT_ISSUER
  });
}

function validateAndDecodeJwt(headerValue: string): JwtPayload {
  const parts = headerValue.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new HttpError(400);
  }
  const token = parts[1];

  const decoded = jwt.decode(token) as JwtPayload | null;

  if (!decoded
      || !decoded.id
      || (decoded.exp && decoded.exp * 1000 <= Date.now())
  ) {
    throw new HttpError(401);
  }

  return decoded;
}

export function checkResetTokenValidity(requiredStep: number) {
  return (req: Request, _res: Response, next: NextFunction) => {
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

export async function verifyPin(req: Request, _res: Response, next: NextFunction) {
  if (!req.body.pin) {
    throw new HttpError(400);
  }

  if (!req.user) {
    throw new HttpError(401);
  }

  const { pin: hashedPin } = await SQL_GET_USER_PIN({
    user_id: req.user!.id
  }).one();

  const isPinValid = await bcrypt.compare(req.body.pin, hashedPin);
  if (!isPinValid) {
    throw new HttpError(401);
  }

  next();
}

export function authMiddleware(auth: true | Role | Role[] = true) {
  return (req: Request, _res: Response, next: NextFunction) => {
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

function resolveUserIdParameter(id: number | 'me' | undefined, userId: number): number | undefined {
  return id === 'me' ? userId : id;
}

function hasElevatedRole(userRole: Role): boolean {
  return ADMIN_LIKE_ROLES.includes(userRole);
}

function authorizeUserAccess(
  targetUserId: number,
  loggedInUserId: number,
  isElevatedUser: boolean
) {
  if (targetUserId === loggedInUserId) return targetUserId;

  if (!isElevatedUser) throw new HttpError(403);

  return targetUserId;
}

async function authorizeGroupAccess(
  groupId: number,
  loggedInUserId: number,
  isElevatedUser: boolean,
  requiresGrpAdmin: boolean,
  targetMemberId?: number
): Promise<number | { groupId: number; memberId: number }> {
  if (isElevatedUser) {
    return targetMemberId
      ? { groupId, memberId: targetMemberId }
      : groupId;
  }

  const membershipStatus = await SQL_GET_GROUP_MEMBERSHIP_STATUS({
    entity_id: groupId,
    user_id: loggedInUserId
  }).one(new HttpError(404));

  const { is_admin_member: isGroupAdmin, is_member: isMember } = membershipStatus;

  if (!isMember) {
    throw new HttpError(403);
  }

  if (requiresGrpAdmin && !isGroupAdmin) {
    throw new HttpError(403);
  }

  const isTargetingSelf = targetMemberId === loggedInUserId;

  if (targetMemberId && !isTargetingSelf && !isGroupAdmin) {
    throw new HttpError(403);
  }

  return targetMemberId ? { groupId, memberId: targetMemberId } : groupId;
}

async function authorizeEntityAccess(
  entityId: number,
  loggedInUserId: number,
  isElevatedUser: boolean,
  requiresGrpAdmin: boolean,
  memberId?: number
) {
  const entityType = await SQL_GET_ENTITY_TYPE({
    entity_id: entityId
  }).oneFirst(new HttpError(404));

  if (entityType === 'User') {
    return authorizeUserAccess(entityId, loggedInUserId, isElevatedUser);
  }

  if (entityType === 'Group') {
    return authorizeGroupAccess(
      entityId,
      loggedInUserId,
      isElevatedUser,
      requiresGrpAdmin,
      memberId
    );
  }

  throw new HttpError(400);
}

type SingleEntityParams = {
  entity_id: number|'me';
  user_id?: never;
  group_id?: never;
  member_id?: never;
};

type SingleUserParams = {
  user_id: number|'me';
  entity_id?: never;
  group_id?: never;
  member_id?: never;
};

type SingleGroupParams = {
  group_id: number;
  entity_id?: never;
  user_id?: never;
  member_id?: never;
};

type GroupWithMemberParams = {
  group_id: number;
  member_id: number|'me';
  entity_id?: never;
  user_id?: never;
};

type RequestParams =
  | SingleEntityParams
  | SingleUserParams
  | SingleGroupParams
  | GroupWithMemberParams;

type ReturnType<T> = T extends GroupWithMemberParams
  ? { groupId: number, memberId: number}
  : number;

export async function decodeEntityAndVerifyAccess<
  T extends RequestParams,
  ResBody = unknown,
  ReqBody = unknown,
  Query = unknown
>(
  req:Request<T, ResBody, ReqBody, Query>,
  allowAdminOverride = false,
  requiresGrpAdmin = false
): Promise<ReturnType<T>> {
  if (!req.user) throw new HttpError(401);

  const { id: loggedInUserId, role: loggedInUserRole } = req.user;
  const isElevatedUser = allowAdminOverride && hasElevatedRole(loggedInUserRole);

  const params = {
    user_id: resolveUserIdParameter(req.params.user_id, loggedInUserId),
    member_id: resolveUserIdParameter(req.params.member_id, loggedInUserId),
    entity_id: resolveUserIdParameter(req.params.entity_id, loggedInUserId),
    group_id: req.params.group_id
  };

  if (params.user_id !== undefined) {
    return authorizeUserAccess(
      params.user_id,
      loggedInUserId,
      isElevatedUser
    ) as ReturnType<T>;
  }

  if (params.group_id !== undefined) {
    return await authorizeGroupAccess(
      params.group_id,
      loggedInUserId,
      isElevatedUser,
      requiresGrpAdmin,
      params.member_id
    ) as ReturnType<T>;
  }

  if (params.entity_id !== undefined) {
    return await authorizeEntityAccess(
      params.entity_id,
      loggedInUserId,
      isElevatedUser,
      requiresGrpAdmin,
      params.member_id
    ) as ReturnType<T>;
  }

  throw new HttpError(400);
}