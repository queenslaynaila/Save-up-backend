import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import verifyGroupMembership from '../../utils';
import { candidatesSchema, Candidates } from './getGroupElectionResults';

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
        election_id: z.string()
          .regex(/^[1-9]\d*$/),
        group_id: z.string()
          .regex(/^[1-9]\d*$/)
      })
    },
    response: {
      200: {
        schema: z.array(candidatesSchema)
      }
    },
    authMiddlewareOptions: {},
    middlewares: [
      verifyGroupMembership({ 
        privilegedRoles: 'all'
      })
    ],
    handler: async (req, res) => {
      const candidates = await SQL_GET_CANDIDATES({
        election_id: Number(req.params.election_id),
        group_id: Number(req.params.group_id)
      }).many();

      return res.json(candidates);
    }
  });
};

export default getCandidates;