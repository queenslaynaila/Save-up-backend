import Router from '../../router';
import { sql } from '../../db';

import {
  CandidateRes,
  CandidateReq,
  candidateParamSchema,
  candidateResSchema
} from './types';
import { z } from 'zod';

const SQL_GET_ELECTION_RESULTS = sql<CandidateReq, CandidateRes>(`
  SELECT * FROM get_candidates(:group_id, :election_id, :user_id) 
`);

const viewResults = (router: Router) => {
  router.route({
    method: 'get',
    path: '/:election_id/results',
    summary: 'View an election result progress',
    request: {
        params: z.object({
            election_id: z.string()
        }),
      body: z.object({
        group_id: z.number()
        })
    },
    response: {
      200: {
        schema: z.array(candidateResSchema)
      }
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const groups = await SQL_GET_ELECTION_RESULTS({
        election_id: Number(req.params.election_id),
        group_id: req.body.group_id, 
        user_id: req.user!.id
      }).many();
      return res.json(groups);
    }
  });
};

export default viewResults;