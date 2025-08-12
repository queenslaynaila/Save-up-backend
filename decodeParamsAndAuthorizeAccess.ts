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

function resolveMeAlias(id: number | 'me' | undefined, loggedInUserId: number): number | undefined {
  return id === 'me' ? loggedInUserId : id;
}

async function authorizeGroupAccess(
  groupId: number,
  loggedInUserId: number,
  hasAdminByPassPriviledges : boolean,
  requiresGrpAdmin: boolean,
  targetMemberId?: number
): Promise<number | { groupId: number; memberId: number }> {
  /*
   If the user has bypassprivileges, skip all group membership checks
   and immediately allow access.
  */ 
  if (hasAdminByPassPriviledges) {
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
  hasAdminByPassPriviledges : boolean,
  requiresGrpAdmin: boolean,
  memberId?: number
) {
  const entityType = await SQL_GET_ENTITY_TYPE({
    entity_id: entityId
  }).oneFirst(new HttpError(404));

  if (entityType === 'User')  {
    if (!hasAdminByPassPriviledges) throw new HttpError(403);
    return entityId;
  }

  if (entityType === 'Group') {
    return authorizeGroupAccess(
      entityId,
      loggedInUserId,
      hasAdminByPassPriviledges ,
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
 * Runs immediately after authentication. 
 * 
 * Decodes route parameters like user_id, group_id, entity_id, member_id
 * replacing me aliases w logged in userid
 * 
 * Then perform access control based on resolved params.
 *
 * @param req -  incoming Express request object.
 * 
 * @param isAdminByPassAllowed - (default: false)
 *   If true, users with elevated roles (Admin or Moderator) are allowed to:
 *     - Access other users' data.
 *     - Accessing any group’s data, regardless of membership.
 *   If false, access is limited to the resource owner (
 *    for user resources, this is the user; 
 *    for group resources, this is a groupmember
 *   ).
 * 
 * @param requiresGrpAdmin - (default: false)
 *   Only applies to group-related routes.
 *   If true, the current user must be a group admin 
 *   to access the requested grp resource.
 * 
 * @returns
 *   - If the route has both `group_id` and `member_id` in params (i.e., targets a specific group member), 
 *    returns an object: { groupId, memberId }.
 *   - Otherwise, returns a single number representing the resolved user, group, or entity ID.
 *   - Throws HttpError on unauthorized or invalid access.
 */

export async function decodeParamsAndAuthorizeAccess<
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
  const hasAdminByPassPriviledges = isAdminByPassAllowed && ADMIN_LIKE_ROLES.includes(loggedInUserRole);

  const params = {
    user_id: resolveMeAlias(req.params.user_id, loggedInUserId),
    member_id: resolveMeAlias(req.params.member_id, loggedInUserId),
    entity_id: resolveMeAlias(req.params.entity_id, loggedInUserId),
    group_id: req.params.group_id
  };

  // Immediately allow access if requested entity or user is logged in user.
  if (
    params.entity_id === loggedInUserId ||
    params.user_id === loggedInUserId
  ) {
    return loggedInUserId as ReturnType<T>;
  }

  if (params.user_id !== undefined)  {
    if (!hasAdminByPassPriviledges) throw new HttpError(403);
    return params.user_id as ReturnType<T>;
  }

  if (params.group_id !== undefined) {
    return await authorizeGroupAccess(
      params.group_id,
      loggedInUserId,
      hasAdminByPassPriviledges,
      requiresGrpAdmin,
      params.member_id
    ) as ReturnType<T>;
  }
   
  if (params.entity_id !== undefined) {
    return await authorizeEntityAccess(
      params.entity_id,
      loggedInUserId,
      hasAdminByPassPriviledges,
      requiresGrpAdmin,
      params.member_id
    ) as ReturnType<T>;
  }

  throw new HttpError(400);
}