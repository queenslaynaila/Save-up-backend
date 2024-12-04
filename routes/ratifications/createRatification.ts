import Router from '../../router';
import { sql } from '../../db';

import { computeStatus, RatificationInterface } from './types';

const SQL_CREATE_RATIFICATIONS = sql<RatificationInterface, Record<string, never>>(`
  INSERT INTO ratifications (group_id, election_id, user_id, :is_ratified)
  VALUES (:group_id, :election_id, :user_id, :is_ratified); 
`);

const createRatification = (router: Router) => {
  router.route({
    method: 'post',
    path: '/',
    summary: 'Create ratification',
    schema: {
      body: computeStatus
    },
    response: {
      statusCode: 201
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      await SQL_CREATE_RATIFICATIONS({
        ...req.body, user_id: req.user!.id
      }).exec();
      res.sendStatus(201);
    }
  });
};

export default createRatification;