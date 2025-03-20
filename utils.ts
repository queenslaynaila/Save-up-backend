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

function replaceMeWithUserId(id: number | "me" | undefined, userId: number): number {
  return id === "me" ? userId : (id ?? userId);
}

function hasAdminPermissions(userRole:Role, isOwnerOrAdminMod: boolean): boolean {
  return isOwnerOrAdminMod && ADMIN_LIKE_ROLES.includes(userRole);
}

function checkGroupMembership(is_member: boolean, is_admin_member: boolean, requiresGrpAdmin: boolean) {
  if (!is_member) throw new HttpError(403);
  if (requiresGrpAdmin && !is_admin_member) throw new HttpError(403);
}

type RequestParams =
  | { entity_id: number | "me"; user_id?: never; group_id?: never; member_id?: never }
  | { user_id: number | "me"; entity_id?: never; group_id?: never; member_id?: never } 
  | { group_id: number; entity_id?: never; user_id?: never; member_id?: number | "me" };


export async function decodeEntityAndVerifyAccess(
  req: Request<RequestParams, any, any, any, any>,
  isOwnerOrAdminMod: boolean = false,
  requiresGrpAdmin: boolean = false
): Promise<number> {
  if (!req.user) {
    throw new HttpError(401);
  }

  const userId = req.user.id
  const role = req.user.role
  
  const params = req.params!; 

  params.user_id = replaceMeWithUserId(params?.user_id, userId);
  params.member_id = replaceMeWithUserId(params?.member_id, userId);
  params.entity_id = replaceMeWithUserId(params?.entity_id, userId);

  if (params.user_id === userId || 
      params.entity_id === userId
    ){ return userId; }

  if (params.user_id) {
    if (!hasAdminPermissions(role, isOwnerOrAdminMod)) throw new HttpError(403);
    return params.user_id;
  }

  if (params.group_id) {
    if (hasAdminPermissions(role, isOwnerOrAdminMod)) return userId;
    
    const { is_admin_member, is_member } = await SQL_GET_GROUP_MEMBERSHIP_STATUS({
      entity_id: params.group_id,
      user_id: userId
    }).one();

    checkGroupMembership(is_member, is_admin_member, requiresGrpAdmin);
    return params.group_id;
  }

  const entityType = await SQL_GET_ENTITY_TYPE({
     entity_id: params.entity_id
  }).oneFirst();

  if (entityType === "User" && !hasAdminPermissions(role, isOwnerOrAdminMod)) {
    throw new HttpError(403);
  }

  const { is_admin_member, is_member } = await SQL_GET_GROUP_MEMBERSHIP_STATUS({
    entity_id:params.entity_id,
    user_id: userId
  }).one();

  checkGroupMembership(is_member, is_admin_member, requiresGrpAdmin);

  const isRequestingOtherMember = params.member_id !== undefined && 
                                  userId !== params.member_id;

  if (isRequestingOtherMember && !is_admin_member) {
    throw new HttpError(403)
  }
 
  return params.entity_id;
}
