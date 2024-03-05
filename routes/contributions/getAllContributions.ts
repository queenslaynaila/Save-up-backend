import { Router, Request, Response } from 'express';
import { sql } from '../../db';
import { ContributionSchema } from '../../types';
import authMiddleware from '../../middleware/auth';
import { HttpError } from '../../middleware/errorMiddleware';

const SQL_GET_CONTRIBUTIONS = sql<{ userId?: string; month?: string; }, ContributionSchema>(`SELECT * FROM contributions `);

export default (router: Router) => {
  router.get('/:contributionsIdentifier', authMiddleware(), async (req: Request, res: Response) => {
    const { contributionsIdentifier } = req.params; 
    const { category_id, month, saving_id,user_id } = req.query as { category_id?: string; month?: string; saving_id?: string ;user_id?: string; };
    const loggedInUserId = req.user!.id;
    const isStandardUser = req.user?.role === 'user';
    const queryParams: { userId?: string; saving_id?: string; month?: string; category_id?: string } = {};
    const filters: string[] = [];

    switch (contributionsIdentifier) {
      case 'me':
        filters.push(`saving_id IN (SELECT id FROM savings WHERE user_id = '${loggedInUserId}')`);
        queryParams.userId = loggedInUserId;
        break;
      case 'all':
        if (isStandardUser) {
          throw new HttpError(401, 'Unauthorised');
        }
        break;
      default:
        throw new HttpError(400, 'Bad request');
    }

    if (user_id && !isStandardUser) filters.push(`user_id IN (SELECT user_id FROM savings WHERE user_id = '${user_id}')`);
    if (saving_id) filters.push(`saving_id = '${saving_id}'`);
    if (category_id) filters.push(`saving_id IN (SELECT id FROM savings WHERE category_id = '${category_id}')`);
    if (month) filters.push(`month = '${month}'`);
    
    let queryString = ''; 
    filters.length > 0? queryString = ` WHERE ${filters.join(' AND ')}` : queryString;
  
    const contributions = await SQL_GET_CONTRIBUTIONS(queryParams).extend(queryString, queryParams).many();
    res.json(contributions);
  });
};
