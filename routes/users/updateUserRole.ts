import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { convertToTitleCase } from '../../middleware/caseNormalization';
import { UserRoleUpdateType, UserRoleParamType } from './types';
import { UserRole, StatusCodeInterface } from '../../globalTypes/index';

const SQL_UPDATE_ROLE = sql<UserRoleUpdateType, Record<string,never>>(`
  SELECT * FROM update_user_role(:targetUserId,:role, :adminId);
`);

export default (router: Router) => {
  router.patch<UserRoleParamType, StatusCodeInterface, Record<string, never>, 
  Record<string, never>>(
    '/:id/:role',
    authMiddleware({ roles: [UserRole.ADMIN] }),
    async (req, res) => {
      const role = convertToTitleCase(req.params.role);
      const targetUserId = req.params.id;
      await SQL_UPDATE_ROLE({ role, targetUserId, adminId: req.user!.id }).exec();
      res.sendStatus(204);
    }
  );
};
