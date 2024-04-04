import { sql } from '../../db';
import { Router } from 'express';
import  { validateRequest } from '../../middleware/validationMiddleware';
import authMiddleware from '../../middleware/auth';
import {ElectionCandidateSchema ,ElectionCandidateResponse} from '../../types';

const SQL_ADD_CANDIDATE_TO_ELECTION = sql<ElectionCandidateSchema, ElectionCandidateResponse>(`
    INSERT INTO election_candidates (election_id, candidate_id)
    VALUES (:election_id, :candidate_id)
    RETURNING election_id, candidate_id, votes, created_at;
`);

export default (router: Router) => { 
  router.post<Record<string, never>, ElectionCandidateResponse, ElectionCandidateSchema, Record<string, never>, Record<string, never>>(
    '/add-candidate',
    authMiddleware(),
    validateRequest(ElectionCandidateSchema),
    async (req, res) => {
      const { election_id, candidate_id } = req.body;
      const newCandidate = await SQL_ADD_CANDIDATE_TO_ELECTION({ election_id, candidate_id }).one();
      res.json(newCandidate);
    }
  );
};
