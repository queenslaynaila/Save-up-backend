import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';

const SQL_CHECK_GROUP_ADMIN = sql<{ user_id: number; group_id: number }, { isAdmin: boolean }>(`
  SELECT EXISTS (
    SELECT 1
    FROM group_administrators
    WHERE user_id = :user_id AND group_id = :group_id
  ) AS "isAdmin"
`);


export default (router: Router) => {
  router.get<Record<string, never>,{ isAdmin: boolean}, { user_id: number; group_id: number }, Record<string, never>, Record<string, never>>(
    '/:group_id',
    authMiddleware(),
    async (req, res) => {
      const user_id= req.user!.id
      const { group_id } = req.params;
      const result = await SQL_CHECK_GROUP_ADMIN({ user_id, group_id }).oneOrNull()
      if (result) {
        res.json({ isAdmin: result.isAdmin });
      } else {
        res.json({ isAdmin: false });
      }
    }
  );
};