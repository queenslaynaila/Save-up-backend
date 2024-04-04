import { sql } from '../../db';
import { Router } from 'express';
import authMiddleware from '../../middleware/auth';
import { validateRequest } from '../../middleware/validationMiddleware';
import { ElectionVoteSchema, ElectionVoteInterface } from '../../types'; 


const SQL_CAST_VOTE = sql< ElectionVoteInterface,{ message: string }>(`
    INSERT INTO votes (election_id, voter_id, group_id, candidate_id)
    VALUES (:election_id, :voter_id, :group_id, :candidate_id)
    RETURNING *;
`);

export default (router: Router) => {
  router.post<Record<string, never>, { message: string },ElectionVoteInterface, Record<string, never>, Record<string, never>>(
    '/vote',
    authMiddleware(),
    validateRequest(ElectionVoteSchema),
    async (req, res) => {
      const { election_id, candidate_id,group_id } = req.body;
      const voter_id = req.user!.id; 
      await SQL_CAST_VOTE({ election_id, voter_id, group_id, candidate_id }).exec();
      res.json({ message: 'Vote cast successfully' });
    }
  );
};
