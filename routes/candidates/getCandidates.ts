import Router from '../../router';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import {
  CandidateRes,
  CandidateReq,
  candidateParamSchema,
  candidateResSchema
} from './types';
import { z } from 'zod';

const SQL_GET_CANDIDATES = sql<CandidateReq, CandidateRes>(`
  SELECT * FROM get_candidates(:group_id, :election_id, :user_id) 
`);

const getCandidates = (router: Router) => {
  router.route({
    method: 'get',
    path: '/',
    summary: 'Get list of candidates',
    schema: {
      body: candidateParamSchema
    },
    response: {
      schema: z.array(candidateResSchema)
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      const groups = await SQL_GET_CANDIDATES({
        ...req.body, user_id: req.user!.id
      }).many();
      return res.json(groups);
    }
  });
};

export default getCandidates;