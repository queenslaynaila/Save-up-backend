import { Router, Response } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import isStandardUser from '../../middleware/isStandardUser';
import { HttpError } from '../../middleware/errorMiddleware';
import { ExpenseInterface, ExpenseQueryInterface } from './types';
import { IdParamInterface, idSchema } from '../../globalTypes/index'

const SQL_GET_EXPENSES = sql<Record<string, string>, ExpenseInterface>(`
  SELECT entity_id, xid, category_id, description, amount, spent_at, created_at
  FROM expenses 
  WHERE deleted_at IS NULL`
);

export default (router: Router) => {
  router.get<IdParamInterface, ExpenseInterface, Record<string,never>, ExpenseQueryInterface>(
    '/:expenseIdentifier', 
    authMiddleware(), 
    async (req, res: Response) => {
      const expenseIdentifier  = req.params.id;
      const entity_id = req.body.entity_id ?? req.user!.id;
      const { category_id, start_date, end_date } = req.query;
      const filterArgs: Record<string, string> = {};
      const filters: string[] = [];

      if (expenseIdentifier === 'me') { // expense for logged in user or requestd grp
        filterArgs.loggedInUserId = entity_id
        filters.push(`entity_id = :loggedInUserId`);
      } else if (!isStandardUser(req.user!.role)) {
        if  (idSchema.parse(parseInt(expenseIdentifier))) {  //by entity id
          filterArgs.user_id = expenseIdentifier;
          filters.push(`entity_id = :user_id`);
        } else {
          throw new HttpError(400, 'Bad request');
        }
      } else {
        throw new HttpError(403, 'Forbidden');
      }

      if (category_id) {
        filterArgs.category_id = category_id;
        filters.push(`category_id = :category_id`);
      }
      if (start_date && end_date) {
        filterArgs.start_date = start_date;
        filterArgs.end_date = end_date;
        filters.push(`created_at BETWEEN :start_date AND :end_date`);
      } else {
        if (start_date) {
          filterArgs.start_date = start_date;
          filters.push(`created_at >= :from_date`);
        }
        if (end_date) {
          filterArgs.end_date = end_date;
          filters.push(`created_at <= :to_date`);
        }
      }

      const query = SQL_GET_EXPENSES({});
      if (filters.length > 0) query.extend(`AND ${filters.join(' AND ')}`, filterArgs);
      query.extend('LIMIT 15', {});
      const expenses = await query.many();
      res.json(expenses);
    });
};