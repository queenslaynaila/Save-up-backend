import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import {  CandidateRes, CandidateParam } from './types'

const SQL_GET_NOMINATED_MEMBERS = sql<{ group_id: number, election_id: number, user_id:number},  CandidateRes>(`
  SELECT * FROM get_nominated_admins(:group_id, :election_id, :user_id) 
`);

export default (router: Router) => {
  router.get<CandidateParam,  CandidateRes[], Record<string,never>, Record<string,never>>(
    '/:group_id/:election_id',
    authMiddleware(),
    async (req, res) => {
      const group_id = parseInt(req.params.group_id);
      const election_id = parseInt(req.params.election_id);
      const groups = await SQL_GET_NOMINATED_MEMBERS({ group_id, election_id, user_id: req.user!.id }).many();
      return res.json(groups);
    }
  );
}; 