import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';
import { CommonGroupInterface } from '../../types';

const SQL_GET_COMMON_GROUPS = sql<{logged_in_user_id: number, user_id: number }, CommonGroupInterface>(`
    SELECT g.id AS group_id, g.group_name, g.description
    FROM user_groups ug1
    INNER JOIN user_groups ug2 ON ug1.group_id = ug2.group_id
    INNER JOIN groups g ON ug1.group_id = g.id
    WHERE ug1.user_id = :logged_in_user_id AND ug2.user_id = :user_id2
`);

export default (router: Router) => {
  router.get<{ user_id: string }, CommonGroupInterface[], Record<string, never>, Record<string, never>>(
    '/common-groups/:user_id',
    authMiddleware(),
    async (req, res) => {
      const logged_in_user_id = req.user!.id;
      const user_id = parseInt(req.params.user_id);
      const commonGroups = await SQL_GET_COMMON_GROUPS({ logged_in_user_id, user_id }).many();
      return res.json(commonGroups);
    });
};
