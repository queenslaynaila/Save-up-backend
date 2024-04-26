import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { NominateParamsInterface, VoteInterface, ApproveAdminInterface  } from './types'
import { MessageInterface } from '../../globalTypes/index'

const SQL_INSERT_VOTE = sql<ApproveAdminInterface, Record<string,never>>(`
  INSERT INTO nomination_approvals (group_id, voter_member_id, nominated_member_id, vote)
  VALUES (:group_id, :voter_member_id, :nominated_member_id, :vote)
`);

export default (router: Router) => {
  router.post<NominateParamsInterface, MessageInterface, VoteInterface, Record<string,never>, Record<string,never>>(
    '/nominate/:group_id/:nominated_member_id',
    authMiddleware(),
    async (req, res) => {
      const { group_id, nominated_member_id } = req.params;
      const { vote } = req.body;
      const voter_member_id = req.user!.id;
      await SQL_INSERT_VOTE({ group_id: parseInt(group_id), voter_member_id, nominated_member_id: parseInt(nominated_member_id), vote }).exec();
      return res.json({ message: 'Vote recorded successfully.' });
    }
  );
};
  