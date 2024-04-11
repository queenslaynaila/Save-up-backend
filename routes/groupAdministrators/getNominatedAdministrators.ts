import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';
import { NominatedAdminInterface } from '../../types';

const SQL_GET_NOMINATED_MEMBERS = sql<{ group_id: number }, NominatedAdminInterface>(`
  SELECT na.group_id, na.user_id, na.nominated_at, u.full_name
  FROM nominated_administrators na
  INNER JOIN users u ON na.user_id = u.id
  WHERE na.group_id = :group_id
`);

export default (router: Router) => {
  router.get<{ group_id: string }, NominatedAdminInterface[], Record<string, never>, Record<string, never>>(
    '/:group_id',
    authMiddleware(),
    async (req, res) => {
      const group_id = parseInt(req.params.group_id);
      const groups = await SQL_GET_NOMINATED_MEMBERS({ group_id }).many();
      return res.json(groups);
    }
  );
};
