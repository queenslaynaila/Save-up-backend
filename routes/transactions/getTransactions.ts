import { Router } from 'express';
import { sql } from '../../db';
import { GetTransactionsInput, GetTransactionResp, GetTransactionQuery } from './types';
import { IdParamInterface } from '../../globalTypes/index';

const SQL_GET_TRANSACTIONS = sql<GetTransactionsInput, GetTransactionResp>(`
    SELECT * FROM (
        SELECT 
            d.id AS transaction_id,
            'Deposit' AS transaction_type
            d.amount,
            NULL AS transfer_from
            d.created_at AS transaction_date
        FROM deposits d
        WHERE d.pocket_id = :pocket_id

        UNION ALL

        SELECT 
            w.id AS transaction_id,
            'Withdrawal' AS transaction_type
            -w.amount ,
            NULL AS transfer_from
            w.created_at AS transaction_date
        FROM withdrawals w
        WHERE w.pocket_id = :pocket_id

        UNION ALL

        SELECT 
            t.id AS transaction_id,
            'Transfer' AS transaction_type
            amount,
            t.source_pocket_id AS transfer_from
            t.created_at AS transaction_date
        FROM transfers t
        WHERE t.destination_pocket_id = :pocket_id
    ) AS transactions
`);

export default (router: Router) => {
  router.get<string,IdParamInterface, GetTransactionResp[], Record<string,never>, GetTransactionQuery>(
    '/:pocket_id', 
    async (req, res) => {
      const pocket_id  = parseInt(req.params.id);
      const { transaction_type, from_date, to_date } = req.query;
      const filters: string[] = [];
      const filterArgs: Record<string, string | Date> = {};

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
}