import { Router } from 'express';
import { sql } from '../../db';
import validateRequest from '../../middleware/validationMiddleware';
import authMiddleware from '../../middleware/authorization';
import { convertToTitleCase } from '../../middleware/caseNormalization';
import { UserRoleUpdateType, UserRoleParamType, 
  userRoleParamSchema
} from './types';
import { UserRole, StatusCodeInterface, 
  headersSchema 
} from '../../globalTypes/index';

const SQL_UPDATE_ROLE = sql<UserRoleUpdateType, Record<string,never>>(`
  SELECT * FROM update_user_role(:targetUserId,:role, :adminId);
`);

export default (router: Router) => {
  router.patch<UserRoleParamType, StatusCodeInterface, Record<string, never>, 
  Record<string, never>>(
    '/:id/:role',
    validateRequest({ 
      headers: headersSchema, params:userRoleParamSchema
    }),
    authMiddleware({ roles: [UserRole.ADMIN] }),
    async (req, res) => {
      const role = convertToTitleCase(req.params.role);
      const targetUserId = req.params.id;
      
      await SQL_UPDATE_ROLE({
        role, targetUserId, adminId: req.user!.id 
      }).exec();
  
      res.sendStatus(204);
    }
  );
};
