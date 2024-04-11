import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';

const SQL_CREATE_GROUP_ADMIN = sql<{ user_id: number; group_id: number }, Record<string, never>>(`
  INSERT INTO group_administrators (group_id, user_id)
  VALUES (:group_id, :user_id)
  RETURNING *;
`);

export default (router: Router) => {
  router.post<Record<string, never>, { message: string }, { user_id: number; group_id: number }, Record<string, never>, Record<string, never>>(
    '/:group_id',
    authMiddleware(),
    async (req, res) => {
      const { user_id } = req.body;
      const { group_id } = req.params;
      await SQL_CREATE_GROUP_ADMIN({ user_id, group_id }).one();
      res.json({ message: 'Group admin created successfully' });
    }
  );
};
