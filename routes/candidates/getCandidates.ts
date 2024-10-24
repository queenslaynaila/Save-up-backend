import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import {
  CandidateRes,
  CandidateParam,
  CandidateReq,
  candidateParamSchema
} from './types';
import validateRequest from '../../middleware/validationMiddleware';

const SQL_GET_CANDIDATES = sql<CandidateReq, CandidateRes>(`
  SELECT * FROM get_candidates(:group_id, :election_id, :user_id) 
`);

export default (router: Router) => {
  router.get<Record<string, never>, CandidateRes[], CandidateParam,
  Record<string, never>>(
    '/',
    validateRequest({
      body: candidateParamSchema
    }),
    authMiddleware(),
    async (req, res) => {
      const groups = await SQL_GET_CANDIDATES({
        ...req.body, user_id: req.user!.id
      }).many();
      return res.json(groups);
    }
  );
};