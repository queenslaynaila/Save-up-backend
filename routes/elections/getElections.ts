import Router from '../../router';
import { sql } from '../../db';
import {
  ElectionRequest,
} from './types';
import { z } from 'zod';

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

const getElections = (router: Router) => {
  router.route({
    method: 'get',
    path: '/',
    summary: 'Get list of elections',
    request: {
      query: z.object({
        group_id: z.string()
      })
    },
    response: {
      200: {
        schema: z.array(ongoingElectionSchema)
      }
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const election = await SQL_GET_ONGOING_ELECTION({
        group_id: parseInt(req.query.group_id),
        user_id: req.user!.id
      }).many();
      res.json(election);
    }
  });
};

export default getElections;