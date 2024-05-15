import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { GetTransactionsInput, GetTransactionResp, GetTransactionQuery } from './types';
import { IdParamInterface } from '../../globalTypes/index';

const SQL_GET_TRANSACTIONS = sql<GetTransactionsInput, GetTransactionResp>(`
    SELECT * FROM transaction_logs WHERE pocket_id = :pocket_id
    RETURNING transaction_id, transaction_type, amount, cumulative_amount, reference_no, created_at AS transaction_date
`);

export default (router: Router) => {
  router.get<IdParamInterface, GetTransactionResp[], Record<string,never>, GetTransactionQuery>(
    '/:pocket_id', 
    authMiddleware(),
    async (req, res) => {
      const pocket_id  = parseInt(req.params.id);
      const { transaction_type, from_date, to_date } = req.query;
      const filters: string[] = [];
      const filterArgs: Record<string, string  > = {};

      if (transaction_type) {
        filterArgs.transaction_type = transaction_type;
        filters.push(`transaction_type = :transaction_type`);
      }
      if (from_date) {
        filterArgs.from_date = from_date;
        filters.push(`transaction_date >= :from_date`);
      }
      if (to_date) {
        filterArgs.to_date = to_date;
        filters.push(`transaction_date <= :to_date`);
      }
      if (filters.length > 0) {
        filterArgs.pocket_id = pocket_id.toString();
        filters.push(`pocket_id = :pocket_id`);
      }

      const query = SQL_GET_TRANSACTIONS({ pocket_id });
      if (filters.length > 0) query.extend(`WHERE ${filters.join(' AND ')}`, filterArgs);
      query.extend('LIMIT 15', {});
      return res.json(await query.many());
    });
};
