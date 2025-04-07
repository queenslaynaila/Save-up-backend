import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import { decodeEntityAndVerifyAccess } from '../../utils';

const SQL_GET_ELECTION_RESULTS = sql<
  {
    group_id:number;
    election_id:number;
    initiator_id:number
    status: 'Closed'
  },
  {
    candidate_id:number;
    full_name:string
  }
>(`
  SELECT
    group_admins.user_id AS candidate_id,
    user_contact_details.full_name
  FROM group_admins
         JOIN user_contact_details
              ON user_contact_details.id = group_admins.user_id
  WHERE group_admins.group_id =:group_id   
    AND group_admins.election_id = :election_id
    AND EXISTS (
    SELECT 1
    FROM elections
    WHERE group_id = :group_id
      AND xid = :election_id
      AND status = :status
      AND closed_at IS NOT NULL
  );

`);

const getGroupElectionResults = (router: Router) => {
  router.route({
    method: 'get',
    path: '/:group_id/elections/:election_id/results',
    summary: 'View an election result progress',
    auth: true,
    schema: {
      params: z.object({
        group_id: z.number().int(),
        election_id: z.number().int()
      })
    },
    response: {
        schema: z.array(
          z.object({
            candidate_id: z.number(),
            full_name: z.string()
          })
        )
    },
    handler: async (req, res) => {
      const groupId = await decodeEntityAndVerifyAccess(req, true);

      const results = await SQL_GET_ELECTION_RESULTS({
        election_id: req.params.election_id,
        group_id: groupId,
        initiator_id: req.user!.id,
        status: 'Closed'
      }).many();

      return res.json(results);
    }
  });
};

export default getGroupElectionResults;