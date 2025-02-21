import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import HttpError from '../../httpError';

const SQL_CREATE_BALLOT = sql< {
    group_id: number;
    election_id: number;
    candidate_id: number;
    user_id: number;
}, Record<string, never>>(`
  SELECT create_ballot(:group_id, :election_id, :candidate_id, :user_id)
`);

const createBallot = (router: Router) => {
  router.route({
    method: 'post',
    path: '/:election_id/ballots',
    summary: 'Vote for a candidate in an election',
    request: {
      params: z.object({
        election_id: z.string()
      }),
      body: z.object({
        group_id: z.number(),
        candidate_id: z.number()
      })
    },
    response: {
      201: {}
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      await SQL_CREATE_BALLOT({
        election_id: Number(req.params.election_id),
        group_id: req.body.group_id,
        candidate_id: req.body.candidate_id,
        user_id: req.user!.id
      }).exec().catch(err=>{
        if (err.code === 'P0007') {
          throw new HttpError(401, { message: 'ERR_ELECTION_CLOSED' });
        }
        if (err.code === 'P0003') {
          throw new HttpError(401, { message: 'ERR_MAX_VOTE_CAST' });
        }
      });
      res.sendStatus(201);
    }
  });
};

export default createBallot;