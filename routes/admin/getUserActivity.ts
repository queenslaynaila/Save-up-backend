import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { BaseTransaction,
  TransactionQueryParams,
  TransactionByEntity,
  baseTransactionSchema 
} from '../usertransactions/types';
import { validateRequest } from '../../middleware/validationMiddleware';
import { UserRole,  GetByPhoneInterface,  GetByIdInterface  } from '../../globalTypes/index';
import { HttpError } from '../../middleware/errorMiddleware'; 

const SQL_GET_USER = sql<GetByPhoneInterface,  GetByIdInterface>(`
  SELECT id 
  FROM user_contact_details 
  WHERE phone_number = :phone_number
`);

const SQL_GET_TRANSACTIONS = sql<TransactionByEntity,  BaseTransaction>(`
  SELECT xid AS transaction_id, 
         transaction_type, 
         amount, 
         reference_no, 
         cumulative_amount, 
         created_at AS transaction_date
  FROM transactions 
  WHERE entity_id = :entity_id
`);

export default (router: Router) => {
  router.get<Record<string,never>,  BaseTransaction[], { phone_number: string }, TransactionQueryParams>(
    '/transactions', 
    validateRequest(baseTransactionSchema),
    authMiddleware({ roles: [UserRole.ADMIN] }),
    async (req, res) => {
      const phone_number = req.body.phone_number;
      const { transaction_type, from_date, to_date } = req.query;

      const user = await SQL_GET_USER({ phone_number })
        .one(new HttpError(404, 'User not found.'));

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
      
      const query = SQL_GET_TRANSACTIONS({ entity_id: user.id });
      if (filters.length > 0) query.extend(`${filters.join(' AND ')}`, filterArgs);
      query.extend('LIMIT 15', {});
      return res.json(await query.many());
    });
};