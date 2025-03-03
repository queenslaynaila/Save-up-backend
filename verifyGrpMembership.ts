import { Request, Response, NextFunction } from 'express';
import { sql } from './db';
import HttpError from './httpError';

const SQL_CHECK_GROUP_MEMBERSHIP = sql<{
  group_id: number;
  user_id: number;
  allow_admin_access: boolean;
}, Record<string, never>>(`
  SELECT check_grp_membership(:group_id, :user_id, :allow_admin_access)
`);

type VerifyOptions = {
  allowAdmins: boolean;
};

const getGroupId = (req: Request): number => {
  const groupId = Number(req.query.group_id) || 
                  Number(req.body.group_id) || 
                  Number(req.params.group_id);

  if (!groupId || isNaN(groupId)) {
    throw new HttpError(400);
  }

  return groupId;
};

export const verifyGroupMembership = (options: VerifyOptions = { allowAdmins: false }) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const groupId = getGroupId(req);
  
    await SQL_CHECK_GROUP_MEMBERSHIP({
      group_id: groupId,
      user_id: req.user!.id,
      allow_admin_access: options.allowAdmins
    }).exec()
      .catch(err => {
        if (err.code === 'P0001') {
         throw new HttpError(403);
        }
        throw err;
    });

    next();
  };
};

export default verifyGroupMembership;