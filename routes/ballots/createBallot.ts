import Router from '../../router';
import { sql } from '../../db';

import {
  BallotInterface,
  ballotBodySchema
} from './types';

const SQL_CREATE_BALLOT = sql<BallotInterface, Record<string, never>>(`
  SELECT create_ballot(:group_id, :election_id, :candidate_id, :user_id)
`);

const createBallot = (router: Router) => {
  router.route({
    method: 'post',
    path: '/',
    summary: 'Create a ballot',
    request: {
      body: ballotBodySchema
    },
    response: {
      201: {}
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      await SQL_CREATE_BALLOT({ ...req.body, user_id: req.user!.id }).exec();
      res.sendStatus(201);
    }
  });
};

export default createBallot;