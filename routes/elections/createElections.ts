import Router from '../../router';
import { sql } from '../../db';
import { ElectionInterface, electionValidation } from './types';

const SQL_CALL_ELECTION = sql<ElectionInterface, Record<string, never>>(`
  SELECT create_election(:group_id, :initiator_id, :type)
`);

const createElections = (router: Router) => {
  router.route({
    method: 'post',
    path: '/',
    summary: 'Create a new election',
    request: {
      body: electionValidation
    },
    response: {
      201: {}
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      await SQL_CALL_ELECTION({
        ...req.body,
        initiator_id: req.user!.id
      }).exec();
      res.sendStatus(201);
    }
  });
};

export default createElections;