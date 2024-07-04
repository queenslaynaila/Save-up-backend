import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { GroupDeposit } from './types';
import { StatusCodeInterface } from '../../globalTypes';

const SQL_CREATE_GROUP_DEPOSIT = sql<GroupDeposit, Record<string,never>>(`
    SELECT * FROM create_group_deposit(:group_id, :user_id, :pocket_id, :amount)
`);

export default (router: Router) => {
  router.post<Record<string,never>, StatusCodeInterface, GroupDeposit, 
  Record<string,never>>(
    '/',
    authMiddleware(),
    async (req, res) => {
      await SQL_CREATE_GROUP_DEPOSIT({
        ...req.body, user_id: req.user!.id
      }).exec();
      res.sendStatus(201);
    }
  );
};