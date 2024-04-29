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
        WHERE d.pocket_id = :pocketId

        UNION ALL

        SELECT 
            w.id AS transaction_id,
            'Withdrawal' AS transaction_type
            -w.amount ,
            NULL AS transfer_from
            w.created_at AS transaction_date
        FROM withdrawals w
        WHERE w.pocket_id = :pocketId

        UNION ALL

        SELECT 
            t.id AS transaction_id,
            'Transfer' AS transaction_type
            amount,
            t.source_pocket_id AS transfer_from
            t.created_at AS transaction_date
        FROM transfers t
        WHERE t.destination_pocket_id = :pocketId
    ) AS transactions
`);

export default (router: Router) => {
  router.get<string,IdParamInterface, GetTransactionResp[], Record<string,never>, GetTransactionQuery>(
    '/:pocket_id', 
    async (req, res) => {
      const pocketId  = parseInt(req.params.id);
      const { transactionType, fromDate, toDate } = req.query;
      const filters: string[] = [];
      const filterArgs: Record<string, string | Date> = {};

      if (transactionType) {
        filterArgs.transaction_type = transactionType;
        filters.push(`transaction_type = :transactionType`);
      }
      if (fromDate) {
        filterArgs.fromDate = fromDate;
        filters.push(`transaction_date >= :fromDate`);
      }
      if (toDate) {
        filterArgs.toDate = toDate;
        filters.push(`transaction_date <= :toDate`);
      }
      if (filters.length > 0) {
        filterArgs.pocketId = pocketId.toString();
        filters.push(`pocket_id = :pocketId`);
      }

      const query = SQL_GET_TRANSACTIONS({ pocketId });
      if (filters.length > 0) query.extend(`WHERE ${filters.join(' AND ')}`, filterArgs);
      query.extend('LIMIT 15', {});
      return res.json(await query.many());
    });
}