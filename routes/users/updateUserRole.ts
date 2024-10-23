import { Router } from 'express';
import { sql } from '../../db';
import validateRequest from '../../middleware/validationMiddleware';
import authMiddleware from '../../middleware/authorization';
import { convertToTitleCase } from '../../middleware/caseNormalization';
import { 
  UserRoleUpdateType, 
  UserRoleParamType, 
  userRoleParamSchema,
  UpdatedUser
} from './types';
import { UserRole } from '../../globalTypes';

const SQL_UPDATE_ROLE = sql<UserRoleUpdateType, UpdatedUser>(`
  SELECT * FROM update_user_role(:targetUserId,:role, :adminId);
`);

export default (router: Router) => {
  router.patch<UserRoleParamType, UpdatedUser, Record<string, never>, 
  Record<string, never>>(
    '/:id/:role',
    authMiddleware({ roles: [UserRole.ADMIN] }),
    validateRequest({ 
      params:userRoleParamSchema
    }),
    async (req, res) => {
      const role = convertToTitleCase(req.params.role);
      const targetUserId = req.params.id;
      
      const user = await SQL_UPDATE_ROLE({
        role, targetUserId, adminId: req.user!.id 
      }).one();

      res.json(user);
    }
  );
};