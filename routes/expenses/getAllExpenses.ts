import { Router, Request, Response } from 'express';
import { ExtendedExpenseInterface } from '../../types';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';
import { HttpError } from '../../middleware/errorMiddleware';


const SQL_GET_EXPENSES = sql<Record<string, string>, ExtendedExpenseInterface>(`SELECT * FROM expenses`);

export default (router: Router) => {
  router.get('/:expenseIdentifier', authMiddleware(), async (req: Request, res: Response) => {
    const { expenseIdentifier } = req.params; 
    const { category_id, month } = req.query as { category_id?: string; month?: string; };
    const queryParams: { userId?: string; month?: string; category_id?: string } = {};
    const filters: string[] = [];
    const loggedInUserId = req.user!.id;
    const isStandardUser = req.user?.role === 'user';

    switch (expenseIdentifier) {
      case 'me':
        queryParams.userId = loggedInUserId;
        filters.push(`user_id = '${loggedInUserId}'`);
        break;
      case 'all':
        if (!isStandardUser) {
          null
        } else {
          throw new HttpError(403, 'Unauthorized');
        }
        break;
      default:
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
