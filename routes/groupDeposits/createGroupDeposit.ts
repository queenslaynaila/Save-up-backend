import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import {
  depositByGroup,
  DepositByGroup,
  GroupDeposit
} from './types';
import { StatusCodeInterface } from '../../globalTypes';
import validateRequest from '../../middleware/validationMiddleware';

const SQL_CREATE_GROUP_DEPOSIT = sql<GroupDeposit, Record<string, never>>(`
    SELECT * FROM create_group_deposit(:user_id, :group_id, :pocket_id, :amount)
`);

export default (router: Router) => {
  router.post<Record<string, never>, StatusCodeInterface, DepositByGroup,
  Record<string, never>>(
    '/',
    validateRequest({
      body: depositByGroup
    }),
    authMiddleware(),
    async (req, res) => {
      await SQL_CREATE_GROUP_DEPOSIT({
        ...req.body,
        user_id: req.user!.id
      }).exec();
      res.sendStatus(201);
    }
  );
};