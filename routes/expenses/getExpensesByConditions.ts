import { Router, Response } from 'express';
import { z } from 'zod';
import { ExtendedExpenseInterface } from '../../types';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';
import { HttpError } from '../../middleware/errorMiddleware';

const UUIDSCHEMA = z.string().uuid();
const SQL_GET_EXPENSES = sql<Record<string, string>, ExtendedExpenseInterface>(
  `SELECT * FROM expenses`
);

export default (router: Router) => {
  router.get<string,{ expenseIdentifier: string },ExtendedExpenseInterface,Record<string, never>,{ category_id?: string; month?: string }>(
    '/:expenseIdentifier', 
    authMiddleware(), 
    async (req, res: Response) => {
      const { expenseIdentifier } = req.params;
      const { category_id, month } = req.query;
      const filterArgs: Record<string, string> = {};
      const filters: string[] = [];
      const loggedInUserId = req.user!.id;
      const isStandardUser = req.user?.role === 'User';

      if (expenseIdentifier === 'me') {
        filterArgs.loggedInUserId = loggedInUserId;
        filters.push(`user_id = :loggedInUserId`);
      } else if (expenseIdentifier === 'all') {
        if (isStandardUser) {
          throw new HttpError(403, 'Unauthorized');
        }
      } else if (UUIDSCHEMA.parse(expenseIdentifier)) {
        if (isStandardUser) {
          throw new HttpError(401, 'Unauthorized');
        }
        filterArgs.user_id = expenseIdentifier;
        filters.push(`user_id = :expenseIdentifier`);
      } else {
        throw new HttpError(400, 'Bad request');
      }

      if (category_id) {
        filterArgs.category_id = category_id;
        filters.push(`category_id = :category_id`);
      }
      if (month) {
        filterArgs.month = month;
        filters.push(`month = :month`);
      }

      const query = SQL_GET_EXPENSES({});
      if (filters.length > 0) query.extend(`WHERE ${filters.join(' AND ')}`, filterArgs);
      query.extend('LIMIT 15', {});
      const expenses = await query.many();
      res.json(expenses);
    });
};
