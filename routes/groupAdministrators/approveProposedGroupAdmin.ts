import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { NominateParamsInterface, VoteInterface, ApproveAdminInterface  } from './types'
import { MessageInterface } from '../../globalTypes/index'

const SQL_INSERT_VOTE = sql<ApproveAdminInterface, Record<string,never>>(`
  INSERT INTO nomination_approvals (group_id, voter_member_id, nominated_member_id, vote)
  VALUES (:groupId, :voterMemberId, :nominatedMemberId, :vote)
`);

export default (router: Router) => {
  router.post<NominateParamsInterface, MessageInterface, VoteInterface, Record<string,never>, Record<string,never>>(
    '/nominate/:groupId/:nominatedMemberId',
    authMiddleware(),
    async (req, res) => {
      const { groupId, nominatedMemberId } = req.params;
      const { vote } = req.body;
      const voterMemberId = req.user!.id;
      await SQL_INSERT_VOTE({ groupId: parseInt(groupId), voterMemberId, nominatedMemberId: parseInt(nominatedMemberId), vote }).exec();
      return res.json({ message: 'Vote recorded successfully.' });
    }
  );
};
  