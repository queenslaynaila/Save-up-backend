import Router from '../../router';
import { sql } from '../../db';
import { ElectionInterface, electionValidation } from './types';
import { z } from 'zod';
import HttpError from '../../httpError';

const SQL_CALL_ELECTION = sql<
  ElectionInterface & { nomination_ends_at?: string; candidates: number[]|null },
  Record<string, never>
>(`
  SELECT create_election(:group_id, :initiator_id, :type, :nomination_ends_at, :candidates)
`);

const createElections = (router: Router) => {
  router.route({
    method: 'post',
    path: '/',
    summary: 'Create a new election',
    request: {
      body: electionValidation.extend({
        nomination_ends_at: z.string().datetime().optional(),
        candidates_ids: z.array(z.number()).min(1).max(3).optional(),
      })
    },
    response: {
      201: {}
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const { type, group_id, candidates_ids} = req.body;
      await SQL_CALL_ELECTION({
        type,
        group_id,
        nomination_ends_at: req.body.nomination_ends_at 
                  ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        candidates: type === 'Ratification' ? req.body.candidates_ids ?? null : null,
        initiator_id: req.user!.id
      }).exec().catch(err => {
        if (err.code === 'P0001') {
          throw new HttpError(401, { message: 'ERR_NOT_GRP_MBR' });
        }
        if (err.code === 'P0004') {
          throw new HttpError(409, { message: 'ERR_ONGOING_ELECTION_EXISTS' });
        }

      });
      res.sendStatus(201);
    }
  });
};

export default createElections;
