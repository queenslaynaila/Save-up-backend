import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { ExtendedExpenseInterface } from '../../types';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';
import { HttpError } from '../../middleware/errorMiddleware';


const UUIDSCHEMA = z.string().uuid();
const SQL_GET_EXPENSES = sql<Record<string, string>, ExtendedExpenseInterface>(`SELECT * FROM expenses`);

export default (router: Router) => {
  router.get('/:expenseIdentifier', authMiddleware(), async (req: Request, res: Response) => {
    const { expenseIdentifier } = req.params; 
    const { category_id, month } = req.query as { category_id?: string; month?: string; };
    const queryParams: { user_id?: string; month?: string; category_id?: string } = {};
    const filters: string[] = [];
    const loggedInUserId = req.user!.id;
    const isStandardUser = req.user?.role === 'User';

    if (expenseIdentifier === 'me') {
      queryParams.user_id = loggedInUserId;
      filters.push(`user_id = '${loggedInUserId}'`);
    } else if (expenseIdentifier === 'all') {
      if (isStandardUser) {
        throw new HttpError(403, 'Unauthorized');
      }
    } else if (UUIDSCHEMA.parse(expenseIdentifier)) {
      if (isStandardUser) {
        throw new HttpError(401, 'Unauthorized');
      }
      queryParams.user_id = expenseIdentifier;
      filters.push(`user_id = '${expenseIdentifier}'`);
    } else {
      throw new HttpError(400, 'Bad request');
    }
  
    if (category_id) {
      queryParams.category_id = category_id; 
      filters.push(`category_id = '${category_id}'`);
    }
    if (month) {
      queryParams.month = month; 
      filters.push(`month = '${month}'`);
    }
    
    const queryString = filters.length > 0 ? ` WHERE ${filters.join(' AND ')}` : '';
    const expenses = await SQL_GET_EXPENSES(queryParams).extend(queryString, queryParams).many();
    res.json(expenses);
  });
};
