import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { CandidateRes, CandidateParam } from './types'

const SQL_GET_CANDIDATES = sql<{ group_id: number, election_id: number, user_id:number},CandidateRes>(`
  SELECT * FROM get_candidates(:group_id, :election_id, :user_id) 
`);

export default (router: Router) => {
  router.get<Record<string,never>,  CandidateRes[], CandidateParam, Record<string,never>>(
    '/',
    authMiddleware(),
    async (req, res) => {
      const groups = await SQL_GET_CANDIDATES({
        ...req.body, user_id: req.user!.id 
      }).many();
      return res.json(groups);
    }
  );
}; 