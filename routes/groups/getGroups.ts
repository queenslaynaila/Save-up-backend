import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import { groupsSchema } from './schema';
import { userIdParamsSchema } from '../users/schema';

const group = groupsSchema.pick({
  id: true,
  name: true,
  created_at: true
}).extend({
  created_by: z.string()
});

type Group = z.infer<typeof group>;

const SQL_FETCH_USER_GROUPS = sql<
  {
    user_id: number;
    other_user_id?: number;
  },
  Group
>(`
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
    AND groups.deleted_at IS NULL
    AND (:other_user_id::INT IS NULL 
      OR EXISTS (
        SELECT 1 
        FROM group_members 
        WHERE group_members.group_id = groups.id 
          AND group_members.user_id = :other_user_id 
          AND group_members.is_active = TRUE
      )
    )
  ORDER BY groups.created_at DESC
`);

const getUserGroups = (router: Router) => {
  router.route({
    method: 'get',
    path: '/:user_id',
    summary: 'List groups and mutual memberships',
    description: 
      'Returns active groups for a user. Optional `mutual_user_id` filter ' +
      'shows only groups shared with another user.',
    request: {
      params: userIdParamsSchema,
      query: z.object({
        mutual_user_id: z.string()
          .regex(/^[1-9]\d*$/, 'Must be a positive integer')
          .optional()
      })
    },
    response: {
      200: {
        schema: z.array(group)
      }
    },
    authMiddlewareOptions: { allowModeratorAccess: true },
    handler: async (req, res) => {
      const user_id = Number(req.params.user_id);
      const otherUserId = req.query.mutual_user_id 
        ? Number(req.query.mutual_user_id)
        : undefined;

      const groups = await SQL_FETCH_USER_GROUPS({
        user_id,
        other_user_id: otherUserId
      }).many();

      return res.json(groups);
    }
  });
};

export default getUserGroups;