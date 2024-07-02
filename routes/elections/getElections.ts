import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import { ElectionRequest, ElectionRetrieval, electionBodySchema} from './types';

const SQL_GET_ONGOING_ELECTION = sql< ElectionRequest, ElectionRetrieval>(`
  SELECT * FROM get_open_election_for_group(:group_id, :user_id)
`);

export default (router: Router) => {
  router.get<Record<string,never>, ElectionRetrieval, ElectionRequest, Record<string,never>, Record<string,never>>(
    '/',
    validateRequest(electionBodySchema),
    authMiddleware(),
    async (req, res) => {
      const election = await SQL_GET_ONGOING_ELECTION({ 
        ...req.body, 
        user_id:req.user!.id
      }).one();
      res.json(election);
    }
  );
};