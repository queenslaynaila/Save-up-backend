import { Router, Response } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { HttpError } from '../../middleware/errorMiddleware';
import { ExpenseInterface, ExpenseIdentifierInterface, ExpenseQueryInterface } from './types';
import { idSchema } from '../../globalTypes/index';

const SQL_GET_EXPENSES = sql<Record<string, string>, ExpenseInterface>(`
  SELECT entity_id,id,category_id,description,amount_spent,date_spent
  FROM expenses 
  WHERE deleted_at IS NULL`
);

export default (router: Router) => {
  router.get<ExpenseIdentifierInterface, ExpenseInterface, Record<string,never>, ExpenseQueryInterface>(
    '/:expenseIdentifier', 
    authMiddleware(), 
    async (req, res: Response) => {
      const { expenseIdentifier } = req.params;
      const { category_id, start_date, end_date } = req.query;
      const filterArgs: Record<string, string> = {};
      const filters: string[] = [];
      const loggedInUserId = req.user!.id;
      const isStandardUser = req.user?.role === 'User';

      if (expenseIdentifier === 'me') {
        filterArgs.loggedInUserId = loggedInUserId.toString()
        filters.push(`entity_id = :loggedInUserId`);
      } else if (expenseIdentifier === 'all') {
        if (isStandardUser) {
          throw new HttpError(403, 'Forbidden');
        }
      } else if (idSchema.parse(parseInt(expenseIdentifier))) { 
        if (isStandardUser)  {
          throw new HttpError(403, 'Forbidden');
        }
        filterArgs.user_id = expenseIdentifier;
        filters.push(`entity_id = :user_id`);
      } else {
        throw new HttpError(400, 'Bad request');
      }

      if (start_date && end_date) {
        filterArgs.start_date = start_date;
        filterArgs.end_date = end_date;
        filters.push(`date_spent BETWEEN :start_date AND :end_date`);
      }
      if (category_id) {
        filterArgs.category_id = category_id;
        filters.push(`category_id = :category_id`);
      }
      const query = SQL_GET_EXPENSES({});
      if (filters.length > 0) query.extend(`AND ${filters.join(' AND ')}`, filterArgs);
      query.extend('LIMIT 15', {});
      const expenses = await query.many();
      res.json(expenses);
    });
};