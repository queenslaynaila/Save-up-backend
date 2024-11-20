import Router from '../../router';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { transactionBody } from './types';
import { ParsedQs } from 'qs';
import {
  TransactionByUser,
  BaseTransaction,
  baseTransaction,
  transactionQueryParams
} from '../usertransactions/types';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
extendZodWithOpenApi(z);

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

const getTransactionsForPocket = (router: Router) => {
  router.route({
    method: 'get',
    path: '/:pocket_id/transactions',
    summary: 'Get transactions for a pocket',
    security: [{ 'authorization-token': [] }],
    middlewares: [authMiddleware()],
    schema: {
      query: transactionQueryParams,
      params: transactionBody
    },
    response: {
      schema: z.array(baseTransaction)
    },
    handler: async (req, res) => {
      const { transaction_type, from_date, to_date } = req.query;
      const filters: string[] = [];
      const filterArgs: string | string [] | ParsedQs | ParsedQs[] = {};

      if (transaction_type) {
        filterArgs.transaction_type = transaction_type;
        filters.push('transaction_type = :transaction_type');
      }
      if (from_date && to_date) {
        filterArgs.from_date = from_date;
        filterArgs.to_date = to_date;
        filters.push('transaction_date BETWEEN :from_date AND :to_date');
      } else {
        if (from_date) {
          filterArgs.from_date = from_date;
          filters.push('transaction_date >= :from_date');
        }
        if (to_date) {
          filterArgs.to_date = to_date;
          filters.push('transaction_date <= :to_date');
        }
      }

      const query = SQL_GET_TRANSACTIONS({
        pocket_id: Number(req.params.pocket_id),
        user_id: req.user!.id
      });
      if (filters.length > 0) query.extend(`AND ${filters.join(' AND ')}`, filterArgs);
      query.extend('LIMIT 15', {});

      return res.json(await query.many());
    }
  });
};

export default getTransactionsForPocket;