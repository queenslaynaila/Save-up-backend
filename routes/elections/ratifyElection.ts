import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import { decodeEntityAndVerifyAccess } from '../../utils';

const SQL_RATIFY_ELECTION = sql<{
  group_id: number;
  election_id: number;
  user_id: number;
  is_ratified: boolean;
}, Record<string,never>>(`
   SELECT ratify_election(:group_id, :election_id,  :user_id, :is_ratified);
`);

const ratifyElection = (router: Router) => {
  router.route({
    method: 'post',
    path: '/:group_id/elections/:election_id/confirm-results',
    summary: 'Ratify an election results',
    request: {
        params: z.object({
            election_id: z.number().int(),
            group_id: z.number().int()
        }),
      body: z.object({
        is_ratified: z.boolean()
      })
    },
    response: {
      201: {}
    },
    auth: true,
    handler: async (req, res) => {
       const groupId = await decodeEntityAndVerifyAccess(req)
      await SQL_RATIFY_ELECTION({
        election_id: req.params.election_id,
        group_id: groupId, 
        user_id: req.user!.id,
        is_ratified: req.body.is_ratified
      }).exec();
      return res.sendStatus(201);
    }
  });
};

export default ratifyElection;