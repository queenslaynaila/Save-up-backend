import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import verifyGroupMembership from '../../utils';

const member = z.object({
  user_id: z.number().min(1),
  full_name: z.string(),
  joined_at: z.string().datetime(),
  is_admin: z.boolean()
});

type Member = z.infer<typeof member>;

const SQL_GET_GROUP_MEMBERS = sql<
  { group_id: number },
  Member
>(`
  SELECT 
    group_members.user_id,
    user_contact_details.full_name,
    EXISTS(
      SELECT 1 
      FROM group_admins
      WHERE group_admins.group_id = :group_id
        AND group_admins.user_id = group_members.user_id
        AND group_admins.election_id = (
          SELECT MAX(latest_admin.election_id) 
          FROM group_admins latest_admin
          WHERE latest_admin.group_id = :group_id
        )
    ) AS is_admin,
    (
      SELECT DISTINCT ON (group_joins.user_id) 
        group_joins.created_at 
      FROM group_joins
      WHERE group_joins.group_id = :group_id
        AND group_joins.user_id = group_members.user_id
      ORDER BY group_joins.user_id, group_joins.xid DESC
    ) AS joined_at
  FROM group_members
  LEFT JOIN user_contact_details 
    ON user_contact_details.id = group_members.user_id
  WHERE group_members.group_id = :group_id
    AND group_members.is_active = TRUE
  ORDER BY is_admin DESC
`);

const getGroupMembers = (router: Router) => {
  router.route({
    method: 'get',
    path: '/:group_id/members',
    summary: 'Get group members',
    description: 'Retrieve all active members of a group with their admin status',
    request: {
      params: z.object({
        group_id: z.string().regex(/^[1-9]\d*$/)
      })
    },
    response: {
      200: {
        schema: z.array(member)
      }
    },
    authMiddlewareOptions: {},
    middlewares: [
      verifyGroupMembership({ allowModeratorAccess: true })
    ],
    handler: async (req, res) => {
      const members = await SQL_GET_GROUP_MEMBERS({
        group_id: Number(req.params.group_id)
      }).many();

      return res.json(members);
    }
  });
};

export default getGroupMembers;