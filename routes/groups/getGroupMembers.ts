import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';

type Group = {
  id: number;
  name: string;
  description: string;
  created_by: number;
  created_at: string;
};

const SQL_FETCH_GROUP_MEMBERS = sql<{ user_id: number, group_id: number }, Group>(`
    SELECT u.full_name
    FROM users u
    INNER JOIN user_groups ug ON u.id = ug.user_id
    WHERE ug.group_id = :group_id
`);

export default (router: Router) => {
  router.get<Record<string, never>, Group[], { user_id: number, group_id: number }, Record<string, never>>(
    '/get-members',
    authMiddleware(),
    async (req, res) => {
      const userId = req.user!.id;
      const { group_id } = req.body;
      const groups = await SQL_FETCH_GROUP_MEMBERS({ user_id: userId , group_id}).many();
      return res.json(groups);
    }
  );
};
