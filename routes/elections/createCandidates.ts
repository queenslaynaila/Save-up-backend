import Router from '../../router';
import { sql } from '../../db';
import { CandidateInterface, candidateRequestBody } from './types';
import { z } from 'zod';

const SQL_CREATE_CANDIDATE = sql<CandidateInterface, Record<string, never>>(`
  SELECT create_candidate(:group_id, :election_id, :candidate_id, :user_id);
`);

const createCandidates = (router: Router) => {
  router.route({
    method: 'post',
    path: '/:election_id/candidates',
    summary: 'Create candidates for an open election',
    request: {
      params: z.object ({
        election_id: z.string(),
      }),
      body: candidateRequestBody.omit({
        election_id: true
      })
    },
    response: {
      201: {}
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      await SQL_CREATE_CANDIDATE({
        group_id: Number(req.body.group_id),
        election_id: Number(req.params.election_id),
        candidate_id: req.body.candidate_id,
        user_id: req.user!.id
      }).exec();
      res.sendStatus(201);
    }
  });
};

export default createCandidates;
