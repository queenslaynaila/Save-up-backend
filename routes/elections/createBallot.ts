import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import HttpError from '../../httpError';
import { decodeEntityAndVerifyAccess } from '../../utils';

const ballotParamsSchema = z.object({
  group_id: z.number(),
  election_id: z.number(),
  candidate_ids: z.array(z.number()).min(1).max(3),
  user_id: z.number()
});

type BallotParams = z.infer<typeof ballotParamsSchema>;

const SQL_CREATE_BALLOT = sql<
Pick<BallotParams, 'group_id'|'election_id'|'candidate_ids'|'user_id'>, 
Record<string, never>>(`
  SELECT create_ballot(
    :group_id,
    :election_id,
    :candidate_ids,
    :user_id
  )
`);

const createBallot = (router: Router) => {
  router.route({
    method: 'post',
    path: '/:group_id/elections/:election_id/ballots',
    summary: 'Submit a vote for a candidate in an election',
    auth: true,
    request: {
      params: ballotParamsSchema.pick({
        group_id: true,
        election_id: true
      }),
      body: ballotParamsSchema.pick({
        candidate_ids: true
      })
    },
    handler: async (req, res) => {
      const groupId = await decodeEntityAndVerifyAccess(req);
      
      await SQL_CREATE_BALLOT({
        group_id: groupId,
        election_id: req.params.election_id,
        user_id: req.user!.id,
        ...req.body
      }).exec().catch(err => {
        if (err.code === '23505') {
          throw new HttpError(409, {
            message: 'ERR_DUPLICATE_VOTE'
          });
        }
        if (err.code === 'P0007') {
          throw new HttpError(401, {
            message: 'ERR_ELECTION_CLOSED'
          });
        }
        if (err.code === 'P0003') {
          throw new HttpError(401, {
            message: 'ERR_MAX_VOTE_CAST'
          });
        }
        throw err;
      });

      res.sendStatus(201);
    }
  });
};

export default createBallot;