import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { StatusCodeInterface } from '../../globalTypes/index'
import { AdminProposalInterface, GroupInterface } from './types'

const SQL_CREATE_GROUP_ADMIN = sql<AdminProposalInterface, Record<string,never>>(`
  INSERT INTO group_administrators (group_id, user_id)
  VALUES (:group_id, :user_id)
  RETURNING *;
`);

export default (router: Router) => {
  router.post<GroupInterface, StatusCodeInterface, AdminProposalInterface, Record<string,never>, Record<string,never>>(
    '/:group_id',
    authMiddleware(),
    async (req, res) => {
      const { receiver_id } = req.body;
      const group_id  = parseInt(req.params.group_id);
      await SQL_CREATE_GROUP_ADMIN({ receiver_id, group_id }).exec();
      res.sendStatus(201);
    }
  );
};