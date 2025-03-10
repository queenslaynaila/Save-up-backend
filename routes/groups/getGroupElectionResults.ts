import Router from '../../router';
import { sql } from '../../db';
import {
  CandidateRes,
  CandidateReq,
  candidateResSchema
} from '../elections/types';
import { z } from 'zod';
import HttpError from '../../httpError';

const SQL_GET_ELECTION_RESULTS = sql<CandidateReq, CandidateRes>(`
  SELECT * FROM get_election_results(:group_id, :election_id, :user_id) 
`);

const getGroupElectionResults = (router: Router) => {
  router.route({
    method: 'get',
    path: '/:group_id/:election_id/results',
    summary: 'View an election result progress',
    request: {
        params: z.object({
            election_id: z.string(),
            group_id: z.string()
        })
    },
    response: {
      200: {
        schema: z.array(candidateResSchema)
      }
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const results = await SQL_GET_ELECTION_RESULTS({
        election_id: Number(req.params.election_id),
        group_id: Number(req.params.group_id), 
        user_id: req.user!.id
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