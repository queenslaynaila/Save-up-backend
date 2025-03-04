import { Request, Response, NextFunction } from 'express';
import { sql } from '../db';
import HttpError from '../httpError';

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

export default function verifyGroupMembership(
  allowAdminsAndModerators = false
) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const groupId = Number(req.params.group_id) ||
                   Number(req.body.group_id) ||
                   Number(req.query.group_id);

    if (!groupId) next();
    
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