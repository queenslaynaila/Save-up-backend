import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import HttpError from '../../httpError';
import { decodeEntityAndVerifyAccess } from '../../utils';

const updateElectionSchema= z.object({
  group_id: z.number(),
  user_id: z.number(),
  election_id: z.number(),
  status: z.enum(['Open', 'Cancelled']).optional().nullable(),
  nomination_ends_at: z.string().datetime().optional().nullable()
});

type UpdateElectionParams = z.infer<typeof updateElectionSchema>;

const SQL_UPDATE_ELECTION = sql<UpdateElectionParams, Record<string, never>>(`
  SELECT update_election(:user_id, :group_id, :election_id, :status::enum_election_status, :nomination_ends_at)
`);

const updateElections = (router: Router) => {
  router.route({
    method: 'patch',
    path: '/:group_id/elections/:election_id',
    summary: 'Update an existing group election',
    description: 'Allows updating election status and nomination end date if not closed',
    request: {
      params: z.object({
        group_id: z.number(),
        election_id: z.number()
      }),
      body: z.object({
        status: z.enum(['Open', 'Cancelled']).optional(),
        nomination_ends_at: z.string().datetime().optional()
      })
    },
    response: {
      200: {},
      400: { schema: z.object({ message: z.string() }) }
    },
    auth: true,
    handler: async (req, res) => {
      const groupId = await decodeEntityAndVerifyAccess(req, true)
      const { election_id } = req.params;
      const { status, nomination_ends_at } = req.body;

      await SQL_UPDATE_ELECTION({
        group_id:groupId,
        election_id: req.params.election_id,
        status: status ?? null,
        nomination_ends_at: nomination_ends_at ?? null,
        user_id: req.user!.id
      }).exec().catch(err => {
          if (err.code === 'P0001') {
            throw new HttpError(401, { message: 'ERR_NOT_GRP_MBR' });
          }
          throw err;
      });

      res.sendStatus(200);
    }
  });
};

export default updateElections;