import { Router, Request, Response } from 'express';
import { ExtendedExpenseInterface } from '../../types';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';


const baseQuery = `SELECT * FROM expenses `;
const SQL_GET_EXPENSES = (baseQuery: string) => sql<Record<string, string>, ExtendedExpenseInterface>(baseQuery);

export default (router: Router) => {
  router.get('/:expenseIdentifier', authMiddleware(), async (req: Request, res: Response) => {
    const { expenseIdentifier } = req.params; 
    const queryParams: { userId?: string; month?: string; category_id?: string } = {};
    const filters: string[] = [];

    if (expenseIdentifier === 'me') {
      const loggedInUserId = req.user!.id;
      queryParams.userId = loggedInUserId;
      filters.push(`user_id = '${loggedInUserId}'`);
    } else if (expenseIdentifier !== 'all' ) {
      filters.push(`user_id = :userId`);
      queryParams.userId = expenseIdentifier; 
    }
    if (req.query.category_id) {
      queryParams.category_id = req.query.category_id as string;
      filters.push(`category_id = '${queryParams.category_id}'`);
    }
    if (req.query.month) {
      queryParams.month = req.query.month as string;
      filters.push(`month = '${queryParams.month}'`);
    }
    let whereClause = '';
    if (filters.length > 0) {
      whereClause = ` WHERE ${filters.join(' AND ')}`;
    }

    const modifiedQuery = `${baseQuery}${whereClause}`;
    console.log(modifiedQuery);
    console.log(queryParams);
    const expenses = await SQL_GET_EXPENSES(modifiedQuery)(queryParams).many();
    res.json(expenses);
  });
};
