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

const SQL_GET_PIN = sql<
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
  id: number,
  expiresIn: string,
  roleOrStep: Role | number,
  isAccess?: boolean,
): string {
  const payload: { id: number; role?: Role; step?: number } = { id };

  if (typeof roleOrStep === "number") {
    payload.step = roleOrStep;
  } else {
    payload.role = roleOrStep;
  }

  const secret = isAccess
      ? Config.JWT_SECRET
      : Config.JWT_REFRESH_SECRET;

  return jwt.sign(
    payload,
    secret,
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

  const decoded = jwt.decode(token) as JwtPayload | null;

  if (!decoded ||
      !decoded.id ||
      (decoded.exp && decoded.exp * 1000 <= Date.now())
  ) {
    throw new HttpError(401);
  }

  return decoded;
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

export async function verifyPin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    throw new HttpError(401);
  }

  const { pin: hashedPin } = await SQL_GET_PIN({
    user_id: req.user!.id
  }).one();

  if (!await bcrypt.compare(req.body.pin, hashedPin)) {
    throw new HttpError(401);
  }

  next();
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

function replaceMeWithUserId(id: number | "me" | undefined, userId: number): number | undefined {
  return id === "me" ? userId : id;
}

function hasSystemAdminPermissions(userRole:Role, isOwnerOrAdminMod: boolean): boolean {
  return isOwnerOrAdminMod && ADMIN_LIKE_ROLES.includes(userRole);
}

async function verifyGroupMembershipPermissions(
  groupId: number,
  userId: number,
  requiresGrpAdmin: boolean,
  memberId?: number
) {
  const { is_admin_member, is_member } = await SQL_GET_GROUP_MEMBERSHIP_STATUS({
    entity_id: groupId,
    user_id: userId
  }).one(new HttpError(404));

  if (
    !is_member ||
    (requiresGrpAdmin && !is_admin_member) ||
    (memberId && userId !== memberId && !is_admin_member)
  ) {
    throw new HttpError(403);
  }

  return memberId ? { groupId, memberId } : groupId;
}

type SingleEntityParams = {
  entity_id: number|"me";
  user_id?: never;
  group_id?: never;
  member_id?: never;
};

type SingleUserParams = {
  user_id: number|"me";
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
  member_id: number|"me";
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

export async function decodeEntityAndVerifyAccess<T extends RequestParams>(
  req: Request<T, any, any, any>,
  isOwnerOrAdminMod = false,
  requiresGrpAdmin = false
): Promise<ReturnType<T>> {
  if (!req.user) {
    throw new HttpError(401);
  }

  const { id: loggedInUserId, role: loggedInUserRole } = req.user;

  const resolvedParams = {
    user_id: replaceMeWithUserId(req.params.user_id, loggedInUserId),
    member_id: replaceMeWithUserId(req.params.member_id, loggedInUserId),
    entity_id: replaceMeWithUserId(req.params.entity_id, loggedInUserId),
    group_id: req.params.group_id
  };

  if (
    resolvedParams.user_id === loggedInUserId ||
    resolvedParams.entity_id === loggedInUserId
  ) return loggedInUserId as ReturnType<T>;

  if (resolvedParams.user_id){
    if (!hasSystemAdminPermissions(loggedInUserRole, isOwnerOrAdminMod))
      throw new HttpError(403);
    return resolvedParams.user_id as ReturnType<T>;
  }

  if (resolvedParams.group_id) {
    if (hasSystemAdminPermissions(loggedInUserRole, isOwnerOrAdminMod)) {
      return resolvedParams.member_id
        ? { groupId: resolvedParams.group_id, memberId: resolvedParams.member_id } as ReturnType<T>
        : resolvedParams.group_id as ReturnType<T>;
    }
    return await verifyGroupMembershipPermissions(
      resolvedParams.group_id,
      loggedInUserId,
      requiresGrpAdmin,
      resolvedParams.member_id
    ) as ReturnType<T>;
  }

  if(resolvedParams.entity_id){
    const entityType = await SQL_GET_ENTITY_TYPE({
      entity_id: resolvedParams.entity_id
    }).oneFirst(new HttpError(404));

    if (entityType === "User"){
      if (!hasSystemAdminPermissions(loggedInUserRole, isOwnerOrAdminMod))
        throw new HttpError(403);
      return resolvedParams.entity_id as ReturnType<T>;
    }

    if (entityType === "Group") {
      if (hasSystemAdminPermissions(loggedInUserRole, isOwnerOrAdminMod)) {
        return resolvedParams.entity_id as ReturnType<T>;
      }
      return await verifyGroupMembershipPermissions(
        resolvedParams.entity_id,
        loggedInUserId,
        requiresGrpAdmin,
        resolvedParams.member_id
      ) as ReturnType<T>;
    }
  }

  throw new HttpError(400);
}