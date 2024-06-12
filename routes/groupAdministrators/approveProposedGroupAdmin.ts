import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { NominateParamsInterface, AdminApprovalInterface  } from './types'
import { StatusCodeInterface } from '../../globalTypes/index'

const SQL_INSERT_VOTE = sql<AdminApprovalInterface, Record<string,never>>(`
  INSERT INTO nomination_approvals (group_id, voter_id, nominee_id, election_id, vote)
  VALUES (:group_id, :voter_id, :nominee_id, :election_id, :vote);
`);

export default (router: Router) => {
  router.post<NominateParamsInterface, StatusCodeInterface, AdminApprovalInterface, Record<string,never>, Record<string,never>>(
    '/nominate/:group_id/:nominee_id',
    authMiddleware(),
    async (req, res) => {
      const { group_id, nominee_id } = req.params;
      const { vote } = req.body;
      const voter_id = req.user!.id;
      await SQL_INSERT_VOTE({ 
        group_id: parseInt(group_id), 
        voter_id, 
        nominee_id: parseInt(nominee_id), 
        election_id:req.body.election_id,
        vote }).exec();
      res.sendStatus(204);
    }
  );
};
  