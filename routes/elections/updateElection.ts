import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import HttpError from '../../httpError';

const updateElectionSchema = z.object({
  group_id: z.number(),
  user_id: z.number(),
  election_id: z.number(),
  status: z.enum(['Open', 'Cancelled']).optional(),
  nomination_ends_at: z.string().datetime().optional()
});

type UpdateElectionParams = z.infer<typeof updateElectionSchema>;

const SQL_UPDATE_ELECTION = sql<UpdateElectionParams, Record<string, never>>(`
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_id = :group_id 
        AND user_id = :user_id 
        AND is_active = TRUE
    ) THEN RAISE EXCEPTION USING
            MESSAGE = 'ERR_NOT_GROUP_MEMBER',
            ERRCODE = 'P0001';
    END IF;

    UPDATE elections
    SET status = COALESCE(:status, status),
        nomination_ends_at = COALESCE(:nomination_ends_at, nomination_ends_at)
    WHERE group_id = :group_id
      AND xid = :election_id
      AND status != 'Closed';
  END $$;
`);

const updateElections = (router: Router) => {
  router.route({
    method: 'patch',
    path: '/:election_id',
    summary: 'Update an existing election',
    description: 'Allows updating election status and nomination end date if not closed',
    request: {
      params: z.object({
        election_id: z.string()
      }),
      body: z.object({
        group_id: z.number(),
        status: z.enum(['Open', 'Cancelled']).optional(),
        nomination_ends_at: z.string().datetime().optional()
      })
    },
    response: {
      200: {},
      400: { schema: z.object({ message: z.string() }) }
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const { election_id } = req.params;
      const { status, nomination_ends_at, group_id } = req.body;

      await SQL_UPDATE_ELECTION({
        group_id,
        election_id: parseInt(election_id),
        status,
        nomination_ends_at,
        user_id: req.user!.id
      }).exec().catch(err => {
          if (err.code === 'P0001') {
            throw new HttpError(401, { message: 'ERR_NOT_GRP_MBR' });
          }
      });

      res.sendStatus(200);
    }
  });
};

export default updateElections;