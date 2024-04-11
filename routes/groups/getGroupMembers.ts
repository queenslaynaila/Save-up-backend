import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';
import { GetGroupMembersInterface  } from '../../types';

const SQL_GET_GROUP_MEMBERS = sql<{ group_id: number }, GetGroupMembersInterface>(`
  SELECT ug.user_id,u.full_name,ug.joined_at
  FROM user_groups ug
  INNER JOIN users u ON ug.user_id = u.id
  WHERE ug.group_id = :group_id
  AND ug.left_at IS NULL
  ORDER BY ug.joined_at ASC;
`);

export default (router: Router) => {
  router.get<{ group_id: string }, GetGroupMembersInterface[], Record<string, never>, Record<string, never>>(
    '/:group_id',
    authMiddleware(),
    async (req, res) => {
      const { group_id } = req.params; 
      const id = parseInt(group_id)
      const groups = await SQL_GET_GROUP_MEMBERS({ group_id:id }).many();
      return res.json(groups);
    }
  );
};
