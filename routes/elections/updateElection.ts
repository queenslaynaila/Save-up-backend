import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import HttpError from '../../httpError';
import { decodeEntityAndVerifyAccess } from '../../utils';

const electionSchema = z.object({
  group_id: z.number().int().min(1),
  user_id: z.number().int().min(1),
  election_id: z.number().int().min(1),
  status: z.enum(['Open', 'Cancelled']).optional().nullable(),
  nomination_ends_at: z.string().datetime().optional().nullable()
});

type ElectionParams = z.infer<typeof electionSchema>;

const SQL_UPDATE_ELECTION = sql<
  ElectionParams,
  Record<string, never>
>(`
  SELECT update_election(
    :user_id,
    :group_id,
    :election_id,
    :status::enum_election_status,
    :nomination_ends_at
  )
`);

const updateElections = (router: Router) => {
  router.route({
    method: 'patch',
    path: '/:group_id/elections/:election_id',
    summary: 'Update an existing group election',
    description: 'Allows updating election status and nomination end date if not closed',
    auth: true,
    request: {
      params: z.object({
        group_id: z.number().int().min(1),
        election_id: z.number().int().min(1)
      }),
      body: z.object({
        status: z.enum(['Open', 'Cancelled']).optional(),
        nomination_ends_at: z.string().datetime().optional()
      })
    },
    handler: async (req, res) => {
      const groupId = await decodeEntityAndVerifyAccess(req, true);

      await SQL_UPDATE_ELECTION({
        group_id: groupId,
        election_id: req.params.election_id,
        user_id: req.user!.id,
        ...req.body
      }).exec().catch(err => {
        if (err.code === 'P0001') {
          throw new HttpError(401, {
            message: 'ERR_NOT_GRP_MBR'
          });
        }
        throw err;
      });

      res.sendStatus(200);
    }
  });
};

export default updateElections;