import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import { 
  candidatesSchema, 
  Candidates 
} from './getGroupElectionResults';
import { decodeEntityAndVerifyAccess } from '../../utils';

const SQL_GET_CANDIDATES = sql<
  {
    election_id: number;
    group_id: number;
  },
  Candidates
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
  router.route({
    method: 'get',
    path: '/:group_id/elections/:election_id/candidates',
    summary: 'Retrieves all candidates nominated for a specific election.',
    request: {
      params: z.object({
        group_id: z.number().int(),
        election_id: z.number(),
      })
    },
    response: {
      200: {
        schema: z.array(candidatesSchema)
      }
    },
    auth: true,
    handler: async (req, res) => {
      const groupId = await decodeEntityAndVerifyAccess(req, true)
      const candidates = await SQL_GET_CANDIDATES({
        group_id: groupId,
        election_id:req.params.election_id,
      }).many();

      return res.json(candidates);
    }
  });
};

export default getCandidates;