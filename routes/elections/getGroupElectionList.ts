import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import { decodeEntityAndVerifyAccess } from '../../utils';
import { ElectionStatus, ElectionType } from './schema';

const adminSchema = z.object({
  user_id: z.number(),
  full_name: z.string(),
});

const ongoingElectionSchema= z.object({
  group_id: z.number().int(),
  election_id: z.number().int(),
  type: ElectionType,
  status: ElectionStatus,
  initiator_id: z.number().int(),
  initiator_name: z.string(),
  nomination_ends_at: z.string().datetime({ offset: true }),
  admins: z.array(adminSchema).nullable(),
});

type OngoingElection = z.infer<typeof ongoingElectionSchema>;


const SQL_GET_ONGOING_ELECTION = sql<{group_id:number; user_id:number}, OngoingElection>(`
  RETURN QUERY
    SELECT
        elections.group_id,
        elections.xid AS election_id,
        elections.type,
        elections.status, 
        elections.initiator_id,
        user_contact_details.full_name AS initiator_name,
        elections.nomination_ends_at,
        elections.created_at,
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'user_id', group_admins.user_id,
                    'full_name', admin_details.full_name
                )
            ) FILTER (WHERE group_admins.user_id IS NOT NULL),
            '[]'::JSONB
        ) AS admins
    FROM elections
    JOIN user_contact_details
        ON elections.initiator_id = user_contact_details.id
    LEFT JOIN group_admins
        ON elections.group_id = group_admins.group_id
        AND elections.xid = group_admins.election_id
    LEFT JOIN user_contact_details AS admin_details
        ON group_admins.user_id = admin_details.id
    WHERE elections.group_id = p_group_id
    GROUP BY elections.group_id, 
              elections.xid, 
              elections.type, 
              elections.status, 
              elections.initiator_id, 
              user_contact_details.full_name, 
              elections.nomination_ends_at, 
              elections.created_at;
`);

const getGroupElectionList = (router: Router) => {
  router.route({
    method: 'get',
    path: '/:group_id/elections',
    summary: 'Get list of elections for a group',
    request: {
      params: z.object({
        group_id: z.number().int()
      })
    },
    response: {
      200: {
        schema: z.array(ongoingElectionSchema)
      }
    },
    auth: true,
    handler: async (req, res) => {
      const groupId = await decodeEntityAndVerifyAccess(req, true)
      const election = await SQL_GET_ONGOING_ELECTION({
        group_id: groupId,
        user_id: req.user!.id
      }).many();
      res.json(election);
    }
  });
};

export default getGroupElectionList;