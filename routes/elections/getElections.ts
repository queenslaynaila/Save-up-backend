import Router from '../../router';
import { sql } from '../../db';
import {
  ElectionRequest,
  ElectionRetrieval,
  electionRetrievalSchema
} from './types';
import { z } from 'zod';

const SQL_GET_ONGOING_ELECTION = sql< ElectionRequest, ElectionRetrieval & {nomination_ends_at:string}>(`
  SELECT * FROM  get_ongoing_election(:group_id, :user_id)
`);

const getElections = (router: Router) => {
  router.route({
    method: 'get',
    path: '/',
    summary: 'Get list of elections',
    request: {
      query: z.object({
        group_id: z.string()
      })
    },
    response: {
      200: {
        schema: electionRetrievalSchema.extend({
          nomination_ends_at: z.string().datetime()
        })
      }
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const election = await SQL_GET_ONGOING_ELECTION({
        group_id: parseInt(req.query.group_id),
        user_id: req.user!.id
      }).one();
      res.json(election);
    }
  });
};

export default getElections;