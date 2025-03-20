import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import HttpError from '../../httpError';
import { electionSchema } from './schema';
import { decodeEntityAndVerifyAccess } from '../../utils';

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
            election_id: z.number(),
            group_id: z.number()
        })
    },
    response: {
      200: {
        schema: z.array(candidatesSchema)
      }
    },
    auth: true,
    handler: async (req, res) => {
      const groupId = await decodeEntityAndVerifyAccess(req, true)
      const results = await SQL_GET_ELECTION_RESULTS({
        xid:req.params.election_id,
        group_id:groupId, 
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