import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';

const SQL_INSERT_VOTE = sql<{ group_id: number; voter_member_id: number; nominated_member_id: number; vote: boolean }, Record<string, never>>(`
  INSERT INTO nomination_approvals (group_id, voter_member_id, nominated_member_id, vote)
  VALUES (:group_id, :voter_member_id, :nominated_member_id, :vote)
`);

export default (router: Router) => {
  router.post<{ group_id: string; nominated_member_id: string }, { message: string }, { vote: boolean }, Record<string, never>, Record<string, never>>(
    '/nominate/:group_id/:nominated_member_id',
    authMiddleware(),
    async (req, res) => {
      const { group_id, nominated_member_id } = req.params;
      const { vote } = req.body;
      const voter_member_id = req.user!.id;
      await SQL_INSERT_VOTE({ group_id: parseInt(group_id), voter_member_id, nominated_member_id: parseInt(nominated_member_id), vote }).exec();
      return res.json({ message: 'Nomination recorded successfully.' });
    }
  );
};
  