import Router from '../../core/router';
import { sql } from '../../db';
import { z } from 'zod';
import { decodeEntityAndVerifyAccess } from '../../utils';
import HttpError from '../../httpError';

const SQL_RATIFY_ELECTION = sql<
{
  group_id: number;
  election_id: number;
  user_id: number;
  is_ratified: boolean;
},
Record<string, never>
>(`
  SELECT ratify_election(
    :group_id,
    :election_id,
    :user_id,
    :is_ratified
  );
`);

const ratifyElection = (router: Router) => {
  router.post({
    path: '/:group_id/elections/:election_id/ratify',
    summary: 'Ratify an election',
    auth: true,
    schema: {
      params: z.object({
        group_id: z.number().int().min(1),
        election_id: z.number().int().min(1)
      }),
      body: z.object({
        is_ratified: z.boolean()
      })
    },
    handler: async (req, res) => {
      const groupId = await decodeEntityAndVerifyAccess(req);

      await SQL_RATIFY_ELECTION({
        group_id: groupId,
        election_id: req.params.election_id,
        user_id: req.user!.id,
        is_ratified: req.body.is_ratified
      }).exec().catch((err) => {
        if (err.code === 'P0007') {
          throw new HttpError(400, { message: 'ERR_ELECTION_CLOSED_OR_CANCELLED' });
        }
        throw err;
      });

      return res.sendStatus(201);
    }
  });
};

export default ratifyElection;