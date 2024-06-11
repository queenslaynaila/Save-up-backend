import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { IdParamInterface } from '../../globalTypes/index';
import { CommonGroupInterface, SharedGroupInterface  } from './types';

const SQL_GET_COMMON_GROUPS = sql<SharedGroupInterface, CommonGroupInterface>(`
  SELECT groups.id AS group_id, 
         groups.name, 
         groups.created_at
  FROM groups
  LEFT JOIN group_users AS ug1 ON groups.id = ug1.group_id  
  LEFT JOIN group_users AS ug2 ON groups.id = ug2.group_id  
  WHERE ug1.user_id = :logged_in_user_id 
  AND ug2.user_id = :user_id
  AND ug1.left_at IS NULL 
  AND ug2.left_at IS NULL;
`);

export default (router: Router) => {
  router.get<IdParamInterface, CommonGroupInterface[],Record<string,never>, Record<string,never>>(
    '/:id/common-groups',
    authMiddleware(),
    async (req, res) => {
      const logged_in_user_id = req.user!.id;
      const user_id = parseInt(req.params.id);
      const commonGroups = await SQL_GET_COMMON_GROUPS({ logged_in_user_id, user_id }).many();
      return res.json(commonGroups);
    });
};