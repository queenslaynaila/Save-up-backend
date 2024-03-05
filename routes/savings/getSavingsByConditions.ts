import { Router, Request, Response } from 'express';
import { sql } from '../../db';
import { savingInterface } from './index';
import authMiddleware from '../../middleware/auth';
import { convertToTitleCase,isValidValue } from '../../middleware/caseNormalization';
import { HttpError } from '../../middleware/errorMiddleware';

const ACCEPTED_STATUS_VALUES = ['In Progress', 'Dormant', 'Completed'];
const ACCEPTED_PRIORITY_VALUES = ['High', 'Intermediate', 'Low'];
const SQL_GET_SAVINGS = sql<{ userId?: string; priority?: string; status?: string; category_id?: string }, savingInterface>(`SELECT * FROM savings `);

export default (router: Router) => {
  router.get('/:savingsIdentifier', authMiddleware(), async (req: Request, res: Response) => {
    const { savingsIdentifier } = req.params; 
    const { category_id, priority, status,user_id } = req.query as {status: string;category_id?: string;priority?: string; user_id:string};
    const queryParams: { user_id?: string; priority?: string; category_id?: string; status?: string } = {};
    const filters: string[] = [];

    const convertedStatus = status ? convertToTitleCase(status) : undefined;
    const convertedPriority = priority ? convertToTitleCase(priority) : undefined;
    const isStandardUser = req.user?.role === 'user';

    switch (savingsIdentifier) {
      case 'me':
        queryParams.user_id = req.user!.id;
        filters.push(`user_id = '${queryParams.user_id}'`);
        break;
      case 'all':
        if (isStandardUser) {
          throw new HttpError(401, 'Unauthorized');
        }
        break;
      default:
        throw new HttpError(400, 'Bad request');
    }
    

    if (user_id) filters.push(`user_id = '${user_id}'`);
    if (category_id) filters.push(`category_id = '${category_id}'`);
    if (convertedPriority && isValidValue(convertedPriority, ACCEPTED_PRIORITY_VALUES)) filters.push(`priority = '${convertedPriority}'`);
    if (convertedStatus && isValidValue(convertedStatus, ACCEPTED_STATUS_VALUES)) filters.push(`status = '${convertedStatus}'`);
    const expenses = await SQL_GET_SAVINGS(queryParams).extend(` WHERE ${filters.join(' AND ')}` ,queryParams).many();
    res.json(expenses);
  });
};
