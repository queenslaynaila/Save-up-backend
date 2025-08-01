import Router from '../../new/router';
import { sql } from '../../db';
import { z } from 'zod';
import HttpError from '../../httpError';
import { candidateSchema } from './schema';
import { decodeEntityAndVerifyAccess } from '../../utils';

const candidateParams = candidateSchema.pick({
  group_id: true,
  election_id: true
}).extend({
  candidate_ids: z.array(z.number()).min(1).max(3),
  user_id: z.number()
});

type CandidatesParams = z.infer<typeof candidateParams>;

const SQL_CREATE_CANDIDATE = sql<
Pick<CandidatesParams, 'group_id' | 'election_id' | 'candidate_ids' | 'user_id'>,
Record<string, never>
>(`
  SELECT create_election_candidates(
    :group_id,
    :election_id,
    :candidate_ids,
    :user_id
  );
`);

const createCandidates = (router: Router) => {
  router.post({
    path: '/:group_id/elections/:election_id/candidates',
    summary: 'Create candidates for an open election',
    auth: true,
    schema: {
      params: z.object({
        group_id: z.number().int().min(1),
        election_id: z.number().int().min(1)
      }),
      body: candidateParams.pick({
        candidate_ids: true
      })
    },
    handler: async (req, res) => {
      const groupId = await decodeEntityAndVerifyAccess(req);

      await SQL_CREATE_CANDIDATE({
        ...req.body,
        group_id: groupId,
        election_id: req.params.election_id,
        user_id: req.user!.id
      }).exec().catch(err => {
        if (err.code === '23505') {
          throw new HttpError(409, {
            message: 'ERR_CANDIDATE_ALREADY_NOMINATED'
          });
        }
        if (err.code === 'P0007') {
          throw new HttpError(401, {
            message: 'ERR_ELECTION_CLOSED OR ERR_NOMINATION_ENDED '
          });
        }
        if (err.code === 'P0003') {
          throw new HttpError(401, {
            message: 'ERR_NOMINATION_ATTEMPTS_EXHAUSTED'
          });
        }
        throw err;
      });

      res.sendStatus(201);
    }
  });
};

export default createCandidates;