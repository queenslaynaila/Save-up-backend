import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import HttpError from '../../httpError';
import { group } from 'console';
import e from 'express';

const SQL_CREATE_BALLOT = sql< {
    group_id: number;
    election_id: number;
    candidate_ids: number[];
    user_id: number;
}, Record<string, never>>(`
  SELECT create_ballot(:group_id, :election_id, :candidate_ids, :user_id)
`);

const createBallot = (router: Router) => {
  router.route({
    method: 'post',
    path: '/:group_id/:election_id/ballots',
    summary: 'Vote for a candidate in an election',
    request: {
      params: z.object({
        election_id: z.string(),
        group_id: z.string()
      }),
      body: z.object({
        candidate_ids: z.array(z.number()).min(1).max(3) 
      })
    },
    response: {
      201: {}
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      await SQL_CREATE_BALLOT({
        election_id: Number(req.params.election_id),
        group_id: Number(req.params.group_id),
        candidate_ids: req.body.candidate_ids,
        user_id: req.user!.id
      }).exec().catch(err=>{
        if (err.code === '23505') {
            throw new HttpError(409, { message: 'ERR_DUPLICATE_VOTE' });
        }
        if (err.code === 'P0007') {
          throw new HttpError(401, { message: 'ERR_ELECTION_CLOSED' });
        }
        if (err.code === 'P0003') {
          throw new HttpError(401, { message: 'ERR_MAX_VOTE_CAST' });
        }
        throw err;
      });
      res.sendStatus(201);
    }
  });
};

export default createBallot;


// /saveup/elections/{group_id}                     Create a new group election 
// /saveup/elections/{group_id}                       Get list of elections for a group
// /saveup/elections/{group_id}/{election_id}            Update an existsing group election 
// /saveup/elections/{group_id}/{election_id}/candidates  Create candidates for an open election
// /saveup/elections/{group_id}/{election_id}/candidates  Get list of candidates for an election

// /saveup/elections/{group_id}/{election_id}/ballots  Vote for a candidate in an election post
// /saveup/elections/{group_id}/{election_id}/results  View an election result progress get 
// /saveup/elections/{group_id}/{election_id}/ratifications  Ratification of election results post 