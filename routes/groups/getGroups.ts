import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import { groupsSchema } from './schema';

const group = groupsSchema.pick({
  id: true,
  name: true,
  created_at: true
}).extend({
  created_by: z.string()
});
type Group = z.infer<typeof group>;

const SQL_FETCH_USER_GROUPS = sql<{ user_id: number; other_user_id?: number|null}, Group>(`
  SELECT 
    groups.id, 
    groups.name, 
    groups.created_at,
    user_contact_details.full_name AS created_by
  FROM groups
  LEFT JOIN group_members ON groups.id = group_members.group_id
  LEFT JOIN user_contact_details ON groups.creator_id = user_contact_details.id
  WHERE group_members.user_id = :user_id
    AND group_members.is_active = TRUE
    AND groups.deleted_at IS NULL
    AND (:other_user_id::INT IS NULL 
      OR EXISTS (
          SELECT 1 FROM group_members 
          WHERE group_members.group_id = groups.id 
          AND group_members.user_id = :other_user_id 
          AND group_members.is_active = TRUE
      )
    );
`);


const getUserGroups = (router:Router) => {
  router.route({
    method: 'get',
    path: '/:user_id',
    summary: 'Get user groups or mutual groups',
    request: {
      params: z.object({
        user_id: z.union([
          z.string().regex(/^[1-9]\d*$/, "Must be a positive integer string"),
          z.literal("me"), 
        ]).default('me' )
      }),
      query: z.object({
        mutual_user_id: z.string().optional()
      })
    },
    response: {
      200: {
        schema: z.array(group)
      }
    },
    authMiddlewareOptions: {allowModeratorAccess: true},
    handler: async (req, res) => {
      const user_id = parseInt(req.params.user_id, 10);

      const otherUserId = req.query.mutual_user_id 
        ? Number(req.query.mutual_user_id) 
        : null;

      const groups = await SQL_FETCH_USER_GROUPS({
        user_id,
        other_user_id: otherUserId
      }).many();
      return res.json(groups);
    }
  });
};

export default getUserGroups;