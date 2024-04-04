import { sql } from '../../db';
import { Router } from 'express';
import authMiddleware from '../../middleware/auth';
import { CreateGroupGoalResponseInterface} from '../../types';

const SQL_FETCH_USER_GROUPS = sql<{ user_id: number }, CreateGroupGoalResponseInterface>(`
  SELECT g.id, g.name, g.description, g.created_by, g.created_at
  FROM groups g
  INNER JOIN user_groups ug ON g.id = ug.group_id
  WHERE ug.user_id = :user_id
`);

export default (router: Router) => {
  router.get<Record<string, never>, CreateGroupGoalResponseInterface[],{ user_id: number }, Record<string, never>>(
    '/my-groups',
    authMiddleware(),
    async (req, res) => {
      const userId = req.user!.id;
      const groups = await SQL_FETCH_USER_GROUPS({ user_id: userId }).many();
      return res.json(groups);
    }
  );
};
