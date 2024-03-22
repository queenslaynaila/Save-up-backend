import { Router, Response } from 'express';
import { ExtendedExpenseInterface } from '../../types';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';
import { HttpError } from '../../middleware/errorMiddleware';
import {ID_SCHEMA}  from '../../types/index';


const SQL_GET_EXPENSES = sql<Record<string, string>, ExtendedExpenseInterface>(
  `SELECT * FROM expenses WHERE deleted_at IS NULL`
);

export default (router: Router) => {
  router.get<string,{ expenseIdentifier: string },ExtendedExpenseInterface,Record<string, never>,{ category_id?: string; start_date?: string; end_date?: string }>(
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
        filters.push(`user_id = :loggedInUserId`);
      } else if (expenseIdentifier === 'all') {
        if (isStandardUser) {
          throw new HttpError(403, 'Unauthorized');
        }
      } else if (ID_SCHEMA.parse(parseInt(expenseIdentifier))) { //get user specific expenses
        if (isStandardUser)  {
          throw new HttpError(401, 'Unauthorized');
        }
        filterArgs.user_id = expenseIdentifier;
        filters.push(`user_id = :expenseIdentifier`);
      } else {
        throw new HttpError(400, 'Bad request');
      }

      if (start_date && end_date) {
        filterArgs.start_date = start_date;
        filterArgs.end_date = end_date;
        filters.push(`expense_spent_at BETWEEN :start_date AND :end_date`);
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
