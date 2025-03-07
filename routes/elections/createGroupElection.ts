import Router from '../../router';
import { sql } from '../../db';
import { ElectionInterface, electionValidation } from './types';
import { z } from 'zod';
import HttpError from '../../httpError';
import verifyGroupMembership from '../../utils';

const SQL_CALL_ELECTION = sql<
  ElectionInterface & { nomination_ends_at?: string; candidates: number[]|null; },
  Record<string, never>
>(`
  SELECT create_election(:group_id, :initiator_id, :type, :nomination_ends_at, :candidates)
`);

const createGroupElection = (router: Router) => {
  router.route({
    method: 'post',
    path: '/:group_id',
    summary: 'Create a new group election',
    request: {
      params: z.object({
        group_id: z.string()
      }),
      body: electionValidation.extend({
        nomination_ends_at: z.string().datetime().optional(),
        candidates_ids: z.array(z.number()).min(1).max(3).optional(),
      })
    },
    response: {
      201: {}
    },
    authMiddlewareOptions: {},
    middlewares: [verifyGroupMembership()],
    handler: async (req, res) => {
      const nominationEndsAt = req.body.nomination_ends_at 
        ?? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();

      await SQL_CALL_ELECTION({
        type: req.body.type,
        group_id: req.body.group_id,
        nomination_ends_at: nominationEndsAt,
        candidates: req.body.candidates_ids ?? null,
        initiator_id: req.user!.id
      }).exec().catch(err => {
        if (err.code === 'P0004') {
          throw new HttpError(409, { message: 'ERR_ELECTION_IN_PROGRESS' });
        }
        if (err.code === 'P0002') {
          throw new HttpError(404, { message:  'ERR_MIN_MEMBERS_NOT_MET'});
        }
        if (err.code === 'P0005') {
          throw new HttpError(404, { message:  'ERR_INVALID_CANDIDATE_COUNT'});
        }
        throw err;
      });

      res.sendStatus(201);
    }
  });
};


export default createGroupElection;
