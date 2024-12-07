import Router from '../../router';
import { sql } from '../../db';

import {
  ElectionRequest,
  ElectionRetrieval,
  electionBodySchema,
  electionRetrievalSchema
} from './types';

const SQL_GET_ONGOING_ELECTION = sql< ElectionRequest, ElectionRetrieval>(`
  SELECT * FROM  get_ongoing_election(:group_id, :user_id)
`);

const getElections = (router: Router) => {
  router.route({
    method: 'get',
    path: '/',
    summary: 'Get list of elections',
    request: {
      body: electionBodySchema
    },
    response: {
      200: {
        schema: electionRetrievalSchema
      }
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const election = await SQL_GET_ONGOING_ELECTION({
        ...req.body,
        user_id: req.user!.id
      }).one();
      res.json(election);
    }
  });
};

export default getElections;