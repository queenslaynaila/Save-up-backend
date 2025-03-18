import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import HttpError from '../../httpError';
import { electionSchema } from './schema';

const electionParams = electionSchema.pick({
  group_id: true,
  xid: true,
  initiator_id: true,
});
type ElectionParams = z.infer<typeof electionParams>;

export const candidatesSchema = z.object({
  candidate_id: z.number(),
  full_name: z.string(),
});
export type Candidates = z.infer<typeof candidatesSchema>;

const SQL_GET_ELECTION_RESULTS = sql<ElectionParams, Candidates>(`
  SELECT * FROM get_election_results(:group_id, :election_id, :user_id) 
`);

const getGroupElectionResults = (router: Router) => {
  router.route({
    method: 'get',
    path: '/:group_id/elections/:election_id/results',
    summary: 'View an election result progress',
    request: {
        params: z.object({
            election_id: z.string(),
            group_id: z.string()
        })
    },
    response: {
      200: {
        schema: z.array(candidatesSchema)
      }
    },
    auth: true,
    handler: async (req, res) => {
      const results = await SQL_GET_ELECTION_RESULTS({
        xid: Number(req.params.election_id),
        group_id: Number(req.params.group_id), 
        initiator_id: req.user!.id
      }).many().catch((err) => {
         if (err.code === 'P0007') {
           throw new HttpError (400, { message: 'ERR_ELECTION_ONGOING' });
          }
          throw err;
      });
      return res.json(results);
    }
  });
};

export default getGroupElectionResults;