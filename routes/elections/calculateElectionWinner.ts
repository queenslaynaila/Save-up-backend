import { sql } from '../../db';
import z from 'zod';
import { Router } from 'express';
import  { validateRequest } from '../../middleware/validationMiddleware';
import authMiddleware from '../../middleware/auth';

const ElectionVoteSchema = z.object({
  election_id: z.number(), 
});

type ElectionCandidateSchema= z.infer<typeof ElectionVoteSchema>;

interface ElectionCandidateResponse {
  candidate_id: number;
  vote_count: number;
}

interface ElectionWinnersResponse {
  topCandidates: ElectionCandidateResponse[];
}
  

const SQL_CALCULATE_ELECTION_WINNERS = sql<ElectionCandidateSchema, ElectionWinnersResponse>(`
    SELECT candidate_id, COUNT(*) AS vote_count
    FROM votes
    WHERE election_id = :election_id
    GROUP BY candidate_id
    ORDER BY vote_count DESC
    LIMIT 2;
`);

export default (router: Router) => { 
  router.post<Record<string, never>, ElectionWinnersResponse, ElectionCandidateSchema, Record<string, never>, Record<string, never>>(
    '/calaculate-election-winners',
    authMiddleware(),
    validateRequest( ElectionVoteSchema),
    async (req, res) => {
      const { election_id } = req.body;
      const newCandidate = await SQL_CALCULATE_ELECTION_WINNERS({ election_id }).one();
      res.json(newCandidate);
    }
  );
};
