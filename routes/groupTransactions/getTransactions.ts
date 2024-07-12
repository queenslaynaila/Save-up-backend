import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { TransactionByGroup, 
  BaseTransaction,
  TransactionByPkt,
  transactionByPkt,
} from './types';
import { 
  transactionQueryParams, 
  TransactionQueryParams 
} from '../usertransactions/types';
import validateRequest from '../../middleware/validationMiddleware';
import { headersSchema } from '../../globalTypes';

const SQL_GROUP_TRANSACTIONS = sql<TransactionByGroup, BaseTransaction>(`
 SELECT * FROM get_group_transactions(:pocket_id, :user_id, :group_id);
`);

export default (router: Router) => {
  router.get<Record<string,never>, BaseTransaction[], TransactionByPkt, 
  TransactionQueryParams>(
    '/', 
    validateRequest({
      headers: headersSchema, 
      body:transactionByPkt,
      query:transactionQueryParams
    }),
    authMiddleware(),
    async (req, res) => {
      const { transaction_type, from_date, to_date } = req.query;
      const filters: string[] = [];
      const filterArgs: Record<string, string  > = {};

      if (transaction_type) {
        filterArgs.transaction_type = transaction_type;
        filters.push(`transaction_type = :transaction_type`);
      }
      if (from_date && to_date) {
        filterArgs.from_date = from_date;
        filterArgs.to_date = to_date;
        filters.push(`transaction_date BETWEEN :from_date AND :to_date`);
      } else {
        if (from_date) {
          filterArgs.from_date = from_date;
          filters.push(`transaction_date >= :from_date`);
        }
        if (to_date) {
          filterArgs.to_date = to_date;
          filters.push(`transaction_date <= :to_date`);
        }
      }
      
      const query = SQL_GROUP_TRANSACTIONS({ 
        ...req.body,
        user_id:req.user!.id,
      });

      if (filters.length > 0) query.extend(`AND ${filters.join(' AND ')}`, filterArgs);
      query.extend('LIMIT 15', {});
      return res.json(await query.many());
    });
};