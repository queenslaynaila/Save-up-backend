import Router from '../../router';
import { sql } from '../../db';
import authMiddleware from '../../authorization';
import {
  BallotComputeInterface,
  ballotBodyRequest,
  BallotResultInterface,
  ballotResultSchema
} from './types';
import { z } from 'zod';

const SQL_GET_ELECTION_WINNERS = sql<BallotComputeInterface, BallotResultInterface>(`
  SELECT * FROM compute_ballot_results(:group_id, :election_id, :user_id)
`);

const computeBallot = (router: Router) => {
  router.route({
    method: 'post',
    path: '/',
    summary: 'Compute election winners',
    schema: {
      body: ballotBodyRequest
    },
    response: {
      schema: z.array(ballotResultSchema)
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      const winners = await SQL_GET_ELECTION_WINNERS({
        ...req.body,
        user_id: req.user!.id
      }).many();
      res.json(winners);
    }
  });
};

export default computeBallot;