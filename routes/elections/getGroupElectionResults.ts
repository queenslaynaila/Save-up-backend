import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import HttpError from '../../httpError';
import { electionSchema } from './schema';
import { decodeEntityAndVerifyAccess } from '../../utils';
import { String40 } from 'aws-sdk/clients/sagemaker';

const SQL_GET_ELECTION_RESULTS = sql<
  {
    group_id:number; 
    xid:number; 
    initiator_id:number
  }, 
  {
    candidate_id:number; 
    full_name:string
  }
>(`
  SELECT * FROM get_election_results(
    :group_id, 
    :election_id, 
    :user_id
  )
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
        xid: req.params.election_id,
        group_id: groupId,
        initiator_id: req.user!.id
      }).many().catch(err => {
        if (err.code === 'P0007') {
          throw new HttpError(400, {
            message: 'ERR_ELECTION_ONGOING'
          });
        }
        throw err;
      });

      return res.json(results);
    }
  });
};

export default getGroupElectionResults;