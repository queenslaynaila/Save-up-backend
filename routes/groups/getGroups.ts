import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import logger from '../../logger';
import { groupsSchema } from './schema';

const group = groupsSchema.pick({
  id: true,
  name: true,
  created_at: true
}).extend({
  created_by: z.string()
});
type Group = z.infer<typeof group>;

const SQL_FETCH_USER_GROUPS = sql<{ user_id:number }, Group>(`
  SELECT
    groups.id, 
    groups.name, 
    groups.created_at,
    user_contact_details.full_name AS created_by
  FROM groups 
  LEFT JOIN group_members 
    ON groups.id = group_members.group_id
  LEFT JOIN user_contact_details 
    ON groups.creator_id = user_contact_details.id
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
      200: {
        schema: z.array(group)
      }
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      logger.info('Fetching user groups');
      const groups = await SQL_FETCH_USER_GROUPS({
        user_id: req.user!.id
      }).many();
      return res.json(groups);
    }
  });
};

export default getUserGroups;