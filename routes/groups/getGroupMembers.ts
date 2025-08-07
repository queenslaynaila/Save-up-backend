import Router from '../../core/router';
import { sql } from '../../db';
import { z } from 'zod';
import { decodeParamsAndAuthorizeAccess } from '../../decodeParamsAndAuthorizeAccess';

const groupMemberSchema = z.object({
  user_id: z.number().int().min(1),
  full_name: z.string(),
  joined_at: z.string(),
  is_admin: z.boolean()
});

type Member = z.infer<typeof groupMemberSchema>;

const SQL_GET_GROUP_MEMBERS = sql<
{ group_id: number },
Pick<Member, 'user_id' | 'full_name' | 'joined_at' | 'is_admin'>
>(`
  SELECT
    group_members.user_id,
    user_contact_details.full_name,

    EXISTS (
      SELECT 1
      FROM group_admins
      WHERE group_admins.group_id = group_members.group_id
        AND group_admins.user_id = group_members.user_id
        AND group_admins.election_id = (
          SELECT election_id
          FROM elections
          WHERE elections.group_id = group_members.group_id
            AND elections.status = 'Closed'
          ORDER BY elections.xid DESC
          LIMIT 1
        )
    ) AS is_admin,

    (
      SELECT group_joins.created_at
      FROM group_joins
      WHERE group_joins.group_id = group_members.group_id
        AND group_joins.user_id = group_members.user_id
      ORDER BY group_joins.xid DESC
      LIMIT 1
    ) AS joined_at
  FROM
    group_members
      JOIN
    user_contact_details ON group_members.user_id = user_contact_details.id
  WHERE
    group_members.group_id = :group_id
    AND group_members.is_active = TRUE
  ORDER BY
    is_admin DESC;
`);

const getGroupMembers = (router: Router) => {
  router.get({
    path: '/:group_id/members',
    summary: 'Get group members',
    auth: true,
    schema: {
      params: z.object({
        group_id: z.number().int().min(1)
      })
    },
    response: {
      schema: z.array(groupMemberSchema.pick({
        user_id: true,
        full_name: true,
        is_admin: true,
        joined_at: true
      }))
    },
    handler: async (req, res) => {
      const groupId = await decodeParamsAndAuthorizeAccess(req, true);
      const members = await SQL_GET_GROUP_MEMBERS({
        group_id: groupId
      }).many();

      return res.json(members);
    }
  });
};

export default getGroupMembers;