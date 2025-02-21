import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import HttpError from '../../httpError';

const candidateSchema = z.object({
  group_id: z.number().min(1),
  election_id: z.number().min(1),
  candidate_ids: z.array(z.number()).min(1).max(3),
  user_id: z.number()
});

type Candidates = z.infer<typeof candidateSchema>;

const SQL_CREATE_CANDIDATE = sql<Candidates, Record<string, never>>(`
  SELECT create_candidates(:group_id, :election_id, :candidate_ids, :user_id);
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
      body: candidateSchema.omit({
        election_id: true,
        user_id: true
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
        candidate_ids: req.body.candidate_ids,
        user_id: req.user!.id
      }).exec().catch(err=>{
        if (err.code === '23505') {
          throw new HttpError(409, { message: 'ERR_CANDIDATE_ALREADY_NOMINATED' });
        }
        if (err.code === 'P0007') {
          throw new HttpError(401, { message: 'ERR_ELECTION_CLOSED' });
        }
        if (err.code === 'P0009') {
          throw new HttpError(401, { message: 'ERR_NOMINATION_ENDED' });
        }
        if (err.code === 'P0003') {
          throw new HttpError(401, { message: 'ERR_NOMINATION_ATTEMPTS_EXHAUSTED' });
        }
        throw err;
       });
      res.sendStatus(201);
    }
  });
};

export default createCandidates;
