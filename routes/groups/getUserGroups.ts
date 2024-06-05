import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { CreateGroupResponseInterface } from './types';
import { GetByUserInterface } from '../../globalTypes/index'

const SQL_FETCH_USER_GROUPS = sql<GetByUserInterface, CreateGroupResponseInterface>(`
  SELECT groups.id, groups.name, groups.created_by, groups.created_at
  FROM groups 
  LEFT JOIN user_groups ON groups.id = user_groups.group_id
  WHERE user_groups.user_id = :user_id
  AND user_groups.left_at IS NULL;
`);

export default (router: Router) => {
  router.get<Record<string,never>, CreateGroupResponseInterface[], GetByUserInterface, Record<string,never>>(
    '/me/:userId/',
    authMiddleware(),
    async (req, res) => {
      const groups = await SQL_FETCH_USER_GROUPS({ user_id: req.user!.id}).many();
      return res.json(groups);
    }
  );
};