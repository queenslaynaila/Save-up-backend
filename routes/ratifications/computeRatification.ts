import Router from '../../router';
import { sql } from '../../db';

import {
  ratificationValidation,
  RatificationResultsInterface,
  ComputeRatificationInterface,
  ratificationResults
} from './types';

const SQL_COMPUTE_RATIFICATIONS = sql<ComputeRatificationInterface
, RatificationResultsInterface>(`
  SELECT * FROM compute_ratification_results(:p_group_id, :p_election_id, :p_user_id)
`);

const computeRatification = (router: Router) => {
  router.route({
    method: 'post',
    path: '/',
    summary: 'Compute ratifications',
    request: {
      body: ratificationValidation
    },
    response: {
      201: {
        schema: ratificationResults
      }
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      await SQL_COMPUTE_RATIFICATIONS({
        ...req.body,
        user_id: req.user!.id
      }).exec();
      res.sendStatus(201);
    }
  });
};

export default computeRatification;