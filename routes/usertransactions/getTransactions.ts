import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { TransactionInput, 
  BaseTransaction,
  TransactionQueryParams,
  TransactionByEntity,
  baseTransactionSchema 
} from './types';
import { validateRequest } from '../../middleware/validationMiddleware';
import { IdParamInterface } from '../../globalTypes/index';

const SQL_GET_TRANSACTIONS = sql<TransactionInput, BaseTransaction>(`
  SELECT xid AS transaction_id, 
         type_id AS transaction_type, 
         reference_id, 
         delta,
         balance, 
         created_at AS transaction_date
  FROM transactions 
  WHERE entity_id = :user_id
  AND pocket_id = :pocket_id
`);

export default (router: Router) => {
  router.get<IdParamInterface, BaseTransaction[], TransactionByEntity, 
  TransactionQueryParams>(
    '/:id', 
    validateRequest(baseTransactionSchema),
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
      
      const query = SQL_GET_TRANSACTIONS({ pocket_id:req.params.id, user_id:req.user!.id });
      if (filters.length > 0) query.extend(`AND ${filters.join(' AND ')}`, filterArgs);
      query.extend('LIMIT 15', {});
      return res.json(await query.many());
    });
};