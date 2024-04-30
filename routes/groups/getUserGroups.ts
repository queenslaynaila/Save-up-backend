import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { CreateGroupResponseInterface } from './types';
import { GetByUserInterface } from '../../globalTypes/index'

const SQL_FETCH_USER_GROUPS = sql<GetByUserInterface, CreateGroupResponseInterface>(`
  SELECT g.id, g.group_name, g.description, g.created_by, g.created_at
  FROM groups g
  INNER JOIN user_groups ug ON g.id = ug.group_id
  WHERE ug.user_id = :user_id
  AND ug.left_at IS NULL
`);

export default (router: Router) => {
  router.get<Record<string,never>, CreateGroupResponseInterface[], GetByUserInterface, Record<string,never>>(
    '/my-groups',
    authMiddleware(),
    async (req, res) => {
      const userId = req.user!.id;
      const groups = await SQL_FETCH_USER_GROUPS({ user_id: userId }).many();
      return res.json(groups);
    }
  );
};