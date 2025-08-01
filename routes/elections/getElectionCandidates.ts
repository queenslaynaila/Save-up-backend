import Router from '../../core/router';
import { sql } from '../../db';
import { z } from 'zod';
import { decodeEntityAndVerifyAccess } from '../../utils';

const SQL_GET_CANDIDATES = sql<
{
  election_id: number;
  group_id: number;
},
{
  candidate_id: number;
  full_name: string;
}
>(`
  SELECT 
    user_contact_details.id AS candidate_id,
    user_contact_details.full_name
  FROM candidates
  INNER JOIN user_contact_details
    ON user_contact_details.id = candidates.candidate_id
  WHERE candidates.group_id = :group_id
    AND candidates.election_id = :election_id
`);

const getCandidates = (router: Router) => {
  router.get({
    path: '/:group_id/elections/:election_id/candidates',
    summary: 'Retrieves all candidates nominated for an election.',
    auth: true,
    schema: {
      params: z.object({
        group_id: z.number().int().min(1),
        election_id: z.number().int().min(1)
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

      const candidates = await SQL_GET_CANDIDATES({
        group_id: groupId,
        election_id: req.params.election_id
      }).many();

      return res.json(candidates);
    }
  });
};

export default getCandidates;