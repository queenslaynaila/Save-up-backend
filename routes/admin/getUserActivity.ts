import Router from '../../router';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import {
  baseTransaction,
  BaseTransaction
} from '../usertransactions/types';
import {
  GetByPhoneInterface,
  GetByIdInterface
} from '../../globalTypes';
import { HttpError } from '../../middleware/errorMiddleware';
import { phoneNumber } from './types';
import { z } from 'zod';

const SQL_GET_USER = sql<GetByPhoneInterface, GetByIdInterface>(`
  SELECT id 
  FROM user_contact_details 
  WHERE phone_number = :phone_number
`);

const SQL_GET_TRANSACTIONS = sql<{ entity_id:number }, BaseTransaction>(`
  SELECT xid AS transaction_id, 
         transaction_type, 
         amount, 
         reference_no, 
         cumulative_amount, 
         created_at AS transaction_date
  FROM transactions 
  WHERE entity_id = :entity_id
`);

const getUserActivity = (router: Router) => {
  router.route({
    method: 'get',
    path: '/transactions',
    summary: 'Get user transactions',
    schema: {
      body: phoneNumber
    },
    response: {
      schema: z.array(baseTransaction)
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      const phone_number = req.body.phone_number;
      const { transaction_type, from_date, to_date } = req.query;

      const user = await SQL_GET_USER({ phone_number })
        .one(new HttpError(404));

      const filters: string[] = [];
      const filterArgs: Record<string, string > = {};

      if (transaction_type) {
        const transactionTypeStr = Array.isArray(transaction_type)
          ? transaction_type[0] as string
          : transaction_type as string;
        filterArgs.transaction_type = transactionTypeStr;
        filters.push('transaction_type = :transaction_type');
      }
      if (from_date && to_date) {
        filterArgs.from_date = Array.isArray(from_date)
          ? from_date[0] as string
          : from_date as string;
        filterArgs.to_date = Array.isArray(to_date) ? to_date[0] as string : to_date as string;
        filters.push('transaction_date BETWEEN :from_date AND :to_date');
      } else {
        if (from_date) {
          filterArgs.from_date = Array.isArray(from_date)
            ? from_date[0] as string
            : from_date as string;
          filters.push('transaction_date >= :from_date');
        }
        if (to_date) {
          filterArgs.to_date = Array.isArray(to_date) ? to_date[0] as string : to_date as string;
          filters.push('transaction_date <= :to_date');
        }
      }

      const query = SQL_GET_TRANSACTIONS({ entity_id: user.id });
      if (filters.length > 0) query.extend(`${filters.join(' AND ')}`, filterArgs);
      query.extend('LIMIT 15', {});
      return res.json(await query.many());
    }
  });
};

export default getUserActivity;