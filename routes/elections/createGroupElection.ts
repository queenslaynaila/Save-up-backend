import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import HttpError from '../../httpError';
import verifyGroupMembership from '../../utils';
import { ElectionType } from './schema';

const RatificationSchema = z.object({
  type: z.literal("Ratification"),
  nomination_ends_at: z.string().optional(),
  candidates_ids: z.array(z.number()).min(2).max(3)
}).strict(); 

const BallotSchema = z.object({
  type: z.literal("Ballot"),
  nomination_ends_at: z.string().optional()
}).strict(); 

const electionParams = z.discriminatedUnion("type", [
  RatificationSchema,
  BallotSchema
]);

const electionSqlPayload = z.object({
  type: ElectionType,
  group_id: z.number(),
  initiator_id: z.number(),
  nomination_ends_at: z.string(),
  candidates_ids: z.array(z.number()).nullable()
});

type ElectionParams = z.infer<typeof electionSqlPayload>;

const SQL_CREATE_ELECTION = sql<ElectionParams, Record<string, never>>(`
  SELECT create_election(
    :group_id,
    :initiator_id,
    :type,
    :nomination_ends_at,
    :candidates_ids
  )
`);

const createGroupElection = (router: Router) => {
  router.route({
    method: 'post',
    path: '/:group_id/elections',
    summary: 'Create a new group election',
    description: 
      'Creates an election for group admin positions.\n\n' +
      'For ratification elections, 2-3 candidates must be specified.\n\n' +
      'Nomination period defaults to 48 hours if not specified.',
    request: {
      params: z.object({
        group_id: z.string().regex(/^[1-9]\d*$/)
      }),
      body: electionParams
    },
    auth: true,
       middlewares: [
      verifyGroupMembership({ requiresGrpAdmin: true })
    ],
    handler: async (req, res) => {
      const groupId = Number(req.params.group_id);
      const userId = req.user!.id;
      const nominationEndsAt = req.body.nomination_ends_at ?? 
                  new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();

      await SQL_CREATE_ELECTION({
        type: req.body.type, 
        group_id: groupId,
        initiator_id: userId,
        nomination_ends_at: nominationEndsAt, 
        candidates_ids: req.body.type === 'Ratification' ? req.body.candidates_ids : null
      }).exec().catch(err => {
        if (err.code === 'P0004') {
          throw new HttpError(409, { message: 'ERR_ELECTION_IN_PROGRESS' });
        }
        if (err.code === 'P0002') {
          throw new HttpError(400, { message: 'ERR_MIN_MEMBERS_NOT_MET' });
        }
        throw err;
      });

      res.sendStatus(201);
    }
  });
};

export default createGroupElection;
