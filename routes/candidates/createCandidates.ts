import Router from '../../router';
import { sql } from '../../db';
import authMiddleware from '../../authorization';
import { CandidateInterface, candidateRequestBody } from './types';

const SQL_CREATE_CANDIDATES = sql<CandidateInterface, Record<string, never>>(`
  INSERT INTO CANDIDATES (group_id, election_id, candidate_id, chosen_by)
  VALUES (:group_id, :election_id, :candidate_id, :chosen_by);
`);

const createCandidates = (router: Router) => {
  router.route({
    method: 'post',
    path: '/',
    summary: 'Create candidates',
    schema: {
      body: candidateRequestBody
    },
    response: {
      statusCode: 201
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      const chosen_by = req.user!.id;
      await SQL_CREATE_CANDIDATES({
        ...req.body,
        chosen_by
      }).exec();
      res.sendStatus(201);
    }
  });
};

export default createCandidates;