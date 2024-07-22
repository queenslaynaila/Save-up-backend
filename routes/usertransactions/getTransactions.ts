import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { 
  TransactionByUser,
  BaseTransaction,
  TransactionBody,
  TransactionQueryParams,
  transactionBody,
  transactionQueryParams
} from './types';
import validateRequest from '../../middleware/validationMiddleware';

const SQL_GET_TRANSACTIONS = sql<TransactionByUser, BaseTransaction>(`
  SELECT 
    transactions.xid AS transaction_id, 
    transaction_types.slug AS transaction_type,
    transactions.delta,
    transactions.balance,
    transactions.created_at AS transaction_date
  FROM 
    transactions
  JOIN 
    transaction_types ON transactions.type_id = transaction_types.id
  WHERE 
    transactions.entity_id = :user_id
    AND transactions.pocket_id = :pocket_id
  ORDER BY 
    transactions.created_at DESC
`);


export default (router: Router) => {
  router.get<Record<string,never>, BaseTransaction[], TransactionBody, 
  TransactionQueryParams>(
    '/', 
    validateRequest({ 
      body:transactionBody, 
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
      
      const query = SQL_GET_TRANSACTIONS({ 
        pocket_id:req.body.pocket_id, 
        user_id:req.user!.id 
      });
      if (filters.length > 0) query.extend(`AND ${filters.join(' AND ')}`, filterArgs);
      query.extend('LIMIT 15', {});
      
      return res.json(await query.many());
    });
};