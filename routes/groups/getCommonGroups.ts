import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { IdParamInterface, idParamSchema } from '../../globalTypes';
import { BaseGroupInterface, SharedGroupInterface  } from './types';
import validateRequest from '../../middleware/validationMiddleware';

const SQL_GET_COMMON_GROUPS = sql<SharedGroupInterface, BaseGroupInterface>(`
  SELECT groups.id AS group_id, 
         groups.name, 
         groups.created_at
  FROM groups
  LEFT JOIN group_members gm1 ON groups.id = gm1.group_id  
  LEFT JOIN group_members gm2 ON groups.id = gm2.group_id  
  WHERE gm1.user_id = :logged_in_user_id 
  AND gm2.user_id = :user_id
  AND gm1.is_active = TRUE
  AND gm2.is_active = TRUE
  AND groups.deleted_at IS NULL;
`);

export default (router: Router) => {
  router.get<IdParamInterface, BaseGroupInterface[],Record<string,never>, 
  Record<string,never>>(
    '/:id/common-groups',
    validateRequest({
      params: idParamSchema
    }),
    authMiddleware(),
    async (req, res) => {
      const logged_in_user_id = req.user!.id;
      const user_id = parseInt(req.params.id);
      const commonGroups = await SQL_GET_COMMON_GROUPS({ 
        logged_in_user_id, user_id 
      }).many();
      return res.json(commonGroups);
    });
};