import Router from '../../router';
import { sql } from '../../db';

import { z } from 'zod';
import { Group, group } from './createGroups';

const SQL_GET_COMMON_GROUPS = sql< { logged_in_user_id: number, user_id: number}, Group>(`
  SELECT groups.id, 
         groups.name, 
         groups.created_at
  FROM groups
  LEFT JOIN group_members gm1 
    ON groups.id = gm1.group_id  
  LEFT JOIN group_members gm2 
    ON groups.id = gm2.group_id  
  WHERE gm1.user_id = :logged_in_user_id 
    AND gm2.user_id = :user_id
    AND gm1.is_active = TRUE
    AND gm2.is_active = TRUE
    AND groups.deleted_at IS NULL;
`);

const getCommonGroups = (router:Router) => {
  router.route({
    method: 'get',
    path: '/:id/common-groups',
    summary: 'View common groups between two users.It takes a param id which is the user id of the other user',
    request: {
      params: z.object({
        id: z.string()
      })
    },
    response: {
      200: {
        schema: z.array(group)
      }
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const logged_in_user_id = req.user!.id;
      const user_id = Number(req.params.id);
      const commonGroups = await SQL_GET_COMMON_GROUPS({
        logged_in_user_id,
        user_id
      }).many();
      return res.json(commonGroups);
    }
  });
};

export default getCommonGroups;