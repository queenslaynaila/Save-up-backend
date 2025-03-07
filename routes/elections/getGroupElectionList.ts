import Router from '../../router';
import { sql } from '../../db';
import {
  ElectionRequest,
} from './types';
import { z } from 'zod';
import verifyGroupMembership from '../../utils';

const ElectionType = z.enum(["Ballot", "Ratification"]); 
const ElectionStatus = z.enum(["Open", "Closed", "Cancelled"]);

const adminSchema = z.object({
  user_id: z.number(),
  full_name: z.string(),
});

const ongoingElectionSchema = z.object({
  group_id: z.number(),
  election_id: z.number(),
  type: ElectionType,
  status: ElectionStatus,
  initiator_id: z.number(),
  initiator_name: z.string(),
  nomination_ends_at: z.string().datetime({ offset: true }),
  admins: z.array(adminSchema).nullable(),
});

type OngoingElection = z.infer<typeof ongoingElectionSchema>;


const SQL_GET_ONGOING_ELECTION = sql<ElectionRequest, OngoingElection>(`
  SELECT * FROM  get_ongoing_election(:group_id, :user_id)
`);

const getGroupElectionList = (router: Router) => {
  router.route({
    method: 'get',
    path: '/:group_id',
    summary: 'Get list of elections for a group',
    request: {
      params: z.object({
        group_id: z.string()
      })
    },
    response: {
      200: {
        schema: z.array(ongoingElectionSchema)
      }
    },
    authMiddlewareOptions: {},
    middlewares: [verifyGroupMembership({allowModeratorAccess: true})],
    handler: async (req, res) => {
      const election = await SQL_GET_ONGOING_ELECTION({
        group_id: parseInt(req.params.group_id),
        user_id: req.user!.id
      }).many();
      res.json(election);
    }
  });
};

export default getGroupElectionList;