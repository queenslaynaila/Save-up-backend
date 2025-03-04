import { Request, Response, NextFunction } from 'express';
import { sql } from '../db';
import HttpError from '../httpError';

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


export default function verifyGroupMembership(options: VerifyOptions = { allowAdmins: false }) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const groupId = Number(req.query.group_id) || Number(req.body.group_id) || Number(req.params.group_id);
    if (!groupId) {
      return next();
    }

    SQL_CHECK_GROUP_MEMBERSHIP({
      group_id: groupId,
      user_id: req.user!.id,
      allow_admin_access: options.allowAdmins
    })
      .exec()
      .then(() => next())
      .catch(err => next(err.code === 'P0001' ? new HttpError(403) : err)); 
  };
}