import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import { Group, groupsSchema } from './schema';
import { entityIdParamsSchema } from '../users/schema';
import { decodeEntityAndVerifyAccess } from '../../utils';

const SQL_FETCH_USER_GROUPS = sql<
  { user_id: number; other_user_id?: number },
  Pick<Group, 'id' | 'name' | 'created_at'> & { created_by: string }
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

const getGroupsByUserId = (router: Router) => {
  router.route({
    method: 'get',
    path: '/:user_id',
    summary: 'Get a user\'s active groups',
    description: 
      'Optional `mutual_user_id` filter ' +
      'shows only groups shared with another user.',
    auth: true,
    request: {
      params: z.object({
        user_id: entityIdParamsSchema
      }),
      query: z.object({
        mutual_user_id: z.number().optional()
      })
    },
    response: {
      200: {
        schema: z.array(
          groupsSchema.pick({
            id: true,
            name: true,
            created_at: true
          }).extend({
            created_by: z.string()
          })
        )
      }
    },
    handler: async (req, res) => {
      const userId = await decodeEntityAndVerifyAccess(req, true);
      
      const groups = await SQL_FETCH_USER_GROUPS({
        user_id: userId,
        ...req.query
      }).many();

      return res.json(groups);
    }
  });
};

export default getGroupsByUserId;