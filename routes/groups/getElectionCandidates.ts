import Router from '../../router';
import { sql } from '../../db';
import {
  CandidateRes,
  CandidateReq,
  candidateResSchema
} from './types';
import { z } from 'zod';
import verifyGroupMembership from '../../utils';

const SQL_GET_CANDIDATES = sql<CandidateReq, CandidateRes>(`
  SELECT * FROM get_candidates(:group_id, :election_id, :user_id) 
`);

const getCandidates = (router: Router) => {
  router.route({
    method: 'get',
    path: '/:group_id/:election_id/candidates',
    summary: 'Get list of candidates for an election',
    request: {
        params: z.object({
            election_id: z.string(),
            group_id: z.string()
        }),
    },
    response: {
      200: {
        schema: z.array(candidateResSchema)
      }
    },
    authMiddlewareOptions: {},
    middlewares:[verifyGroupMembership({allowModeratorAccess:true})],
    handler: async (req, res) => {
      const groups = await SQL_GET_CANDIDATES({
        election_id: parseInt(req.params.election_id),
        group_id: parseInt(req.params.group_id), 
        user_id: req.user!.id
      }).many();
      return res.json(groups);
    }
  });
};

export default getCandidates;