import { sql } from "./db";
import HttpError from "./httpError";
import { Role } from "./routes/users/schema";
import { Request } from 'express';

const SQL_GET_ENTITY_TYPE = sql<{
  entity_id: number;
}, {
  entity_type: 'Group' | 'User'
}>(`
  SELECT entity_type 
  FROM entities 
  WHERE id = :entity_id
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

const ADMIN_LIKE_ROLES: Role[] = ['Admin', 'Moderator'];

function resolveMeAlias(id: number | 'me' | undefined, userId: number): number | undefined {
  return id === 'me' ? userId : id;
}

async function authorizeGroupAccess(
  groupId: number,
  loggedInUserId: number,
  hasElevatedAccess : boolean,
  requiresGrpAdmin: boolean,
  targetMemberId?: number
): Promise<number | { groupId: number; memberId: number }> {
  if (hasElevatedAccess ) {
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
  hasElevatedAccess : boolean,
  requiresGrpAdmin: boolean,
  memberId?: number
) {
  const entityType = await SQL_GET_ENTITY_TYPE({
    entity_id: entityId
  }).oneFirst(new HttpError(404));

  if (entityType === 'User')  {
    if (!hasElevatedAccess) {
      throw new HttpError(403);
    }
    return entityId;
  }

  if (entityType === 'Group') {
    return authorizeGroupAccess(
      entityId,
      loggedInUserId,
      hasElevatedAccess ,
      requiresGrpAdmin,
      memberId
    );
  }

  throw new HttpError(400);
}

type EntityParams = {
  entity_id: number|'me';
  user_id?: never;
  group_id?: never;
  member_id?: never;
};

type UserParams = {
  user_id: number|'me';
  entity_id?: never;
  group_id?: never;
  member_id?: never;
};

type GroupParams = {
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
  | EntityParams
  | UserParams
  | GroupParams
  | GroupWithMemberParams;

type ReturnType<T> = T extends GroupWithMemberParams
  ? { groupId: number, memberId: number}
  : number;


/**
 * Decodes route parameters related to users, entities, or groups and verifies
 * whether the current user has access to the specified resource.
 *
 * @param req - The incoming Express request object.
 * 
 * @param isAdminByPassAllowed - (default: false)
 *   If set to true, users with elevated roles (Admin or Moderator) are
 *   allowed to access resources that do not belong to them. This includes:
 *     - Accessing other users' data.
 *     - Accessing any group’s data, regardless of membership.
 *   If false, access is restricted to the resource owner or group member.
 * 
 * @param requiresGrpAdmin - (default: false)
 *   Only applies to group-related routes.
 *   If true, the current user must be a group admin (not just a member)
 *   to access the resource.
 */

export async function decodeEntityAndVerifyAccess<
  T extends RequestParams,
  ResBody = unknown,
  ReqBody = unknown,
  Query = unknown
>(
  req:Request<T, ResBody, ReqBody, Query>,
  isAdminByPassAllowed = false,
  requiresGrpAdmin = false
): Promise<ReturnType<T>> {
  if (!req.user) throw new HttpError(401);

  const { id: loggedInUserId, role: loggedInUserRole } = req.user;
  const hasElevatedAccess = isAdminByPassAllowed && ADMIN_LIKE_ROLES.includes(loggedInUserRole);

  const params = {
    user_id: resolveMeAlias(req.params.user_id, loggedInUserId),
    member_id: resolveMeAlias(req.params.member_id, loggedInUserId),
    entity_id: resolveMeAlias(req.params.entity_id, loggedInUserId),
    group_id: req.params.group_id
  };

  if (
    params.entity_id === loggedInUserId ||
    params.user_id === loggedInUserId
  ) {
    return loggedInUserId as ReturnType<T>;
  }

  if (params.user_id !== undefined)  {
    if (!hasElevatedAccess) {
      throw new HttpError(403);
    }
    return params.user_id as ReturnType<T>;
  }

  if (params.group_id !== undefined) {
    return await authorizeGroupAccess(
      params.group_id,
      loggedInUserId,
      hasElevatedAccess,
      requiresGrpAdmin,
      params.member_id
    ) as ReturnType<T>;
  }
   
  // Only call authorizeEntityAccess when entity type is uknown
  if (params.entity_id !== undefined) {
    return await authorizeEntityAccess(
      params.entity_id,
      loggedInUserId,
      hasElevatedAccess,
      requiresGrpAdmin,
      params.member_id
    ) as ReturnType<T>;
  }

  throw new HttpError(400);
}