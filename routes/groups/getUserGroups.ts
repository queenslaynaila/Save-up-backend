import Router from '../../router';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { BaseGroupInterface, baseGroupSchema, GroupsByUserInterface } from './types';
import { z } from 'zod';

const SQL_FETCH_USER_GROUPS = sql<GroupsByUserInterface, BaseGroupInterface >(`
  SELECT 
    groups.id, 
    groups.name, 
    groups.created_at
  FROM groups 
  LEFT JOIN group_members 
  ON groups.id = group_members.group_id
  WHERE group_members.user_id = :user_id
  AND group_members.is_active = TRUE 
  AND groups.deleted_at IS NULL;
`);

const getUserGroups = (router:Router) => {
  router.route({
    method: 'get',
    path: '/',
    summary: 'Get groups a user belongs to',
    response: {
      schema: z.array(baseGroupSchema)
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      const groups = await SQL_FETCH_USER_GROUPS({
        user_id: req.user!.id
      }).many();
      return res.json(groups);
    }
  });
};

export default getUserGroups;