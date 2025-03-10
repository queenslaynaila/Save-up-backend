import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import HttpError from '../../httpError';
import verifyGroupMembership from '../../utils';
import { electionSchema} from './schema';

const electionParams = electionSchema.pick({
  group_id: true,
  initiator_id: true,
  type: true,
  nomination_ends_at: true
}).extend({
  candidates_ids: z.array(z.number()).min(1).max(3).optional()
})

type ElectionParams = z.infer<typeof electionParams>;

const SQL_CREATE_ELECTION = sql<ElectionParams, Record<string, never>>(`
  SELECT create_election(
    :group_id,
    :initiator_id,
    :type,
    :nomination_ends_at,
    :candidates
  )
`);

const createGroupElection = (router: Router) => {
  router.route({
    method: 'post',
    path: '/:group_id/elections',
    summary: 'Create a new group election',
    description: 
      'Creates an election for group admin positions.\n\n' +
      'For ratification elections, 1-3 candidates must be specified.\n\n' +
      'Nomination period defaults to 48 hours if not specified.',
    request: {
      params: z.object({
        group_id: z.string().regex(/^[1-9]\d*$/)
      }),
      body: electionParams.pick({
        group_id: true,
        type: true, 
        nomination_ends_at: true,
        candidates_ids: true
      })
    },
    authMiddlewareOptions: {},
    middlewares: [
      verifyGroupMembership({ requiredGroupRole: 'Admin' })
    ],
    handler: async (req, res) => {
      const nominationEndsAt = req.body.nomination_ends_at 
        ?? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();

      await SQL_CREATE_ELECTION({
        type: req.body.type,
        group_id: req.body.group_id,
        nomination_ends_at: nominationEndsAt,
        candidates_ids: req.body.type === 'Ratification' ? req.body.candidates_ids : [],
        initiator_id: req.user!.id
      }).exec().catch(err => {
        if (err.code === 'P0004') {
          throw new HttpError(409, {
            message: 'ERR_ELECTION_IN_PROGRESS'
          });
        }
        if (err.code === 'P0002') {
          throw new HttpError(404, {
            message: 'ERR_MIN_MEMBERS_NOT_MET'
          });
        }
        if (err.code === 'P0005') {
          throw new HttpError(404, {
            message: 'ERR_INVALID_CANDIDATE_COUNT'
          });
        }
        throw err;
      });

      res.sendStatus(201);
    }
  });
};

export default createGroupElection;
