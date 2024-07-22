import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import {
  TransactionByGroup,
  BaseTransaction,
  TransactionByPkt,
  transactionByPkt,
} from './types';
import { 
  transactionQueryParams
} from '../usertransactions/types';
import validateRequest from '../../middleware/validationMiddleware';

const SQL_GROUP_TRANSACTIONS = sql<TransactionByGroup, BaseTransaction>(`
  SELECT * FROM get_group_transactions(:group_id, :user_id, :pocket_id);
`);

export default (router: Router) => {
  router.get<Record<string,never>, BaseTransaction[], TransactionByPkt, 
  Record<string,never>>(
    '/', 
    validateRequest({
      body:transactionByPkt,
      query:transactionQueryParams
    }),
    authMiddleware(),
    async (req, res) => {
      const transactions = await SQL_GROUP_TRANSACTIONS({ 
        ...req.body,
        user_id: req.user!.id
      }).many();
      return res.json(transactions);
    });
};