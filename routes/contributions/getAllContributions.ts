import { Router, Request, Response } from 'express';
import { sql } from '../../db';
import { ContributionSchema } from '../../types';
import authMiddleware from '../../middleware/auth';
import { HttpError } from '../../middleware/errorMiddleware';

const SQL_GET_CONTRIBUTIONS = sql<{ user_id?: string; month?: string; }, ContributionSchema>(`SELECT * FROM contributions `);

export default (router: Router) => {
  router.get('/:contributionsIdentifier', authMiddleware(), async (req: Request, res: Response) => {
    const { contributionsIdentifier } = req.params; 
    const { category_id, month, saving_id,user_id } = req.query as { category_id?: string; month?: string; saving_id?: string ;user_id?: string; };
    const loggedInUserId = req.user!.id;
    const isStandardUser = req.user?.role === 'User';
    const queryParams: { user_id?: string; saving_id?: string; month?: string; category_id?: string } = {};
    const filters: string[] = [];

    switch (contributionsIdentifier) {
      case 'me':
        filters.push(`saving_id IN (SELECT id FROM savings WHERE user_id = '${loggedInUserId}')`);
        queryParams.user_id = loggedInUserId;
        break;
      case 'all':
        if (!isStandardUser) {
          null
        } else {
          throw new HttpError(401, 'Unauthorised');
        }
        break;
      default:
        throw new HttpError(400, 'Bad request');
    }
    

    if (user_id && !isStandardUser) {
      queryParams.user_id = user_id;
      filters.push(`saving_id IN (SELECT id FROM savings WHERE user_id ='${user_id}')`);

    } 
    if (saving_id) {
      queryParams.saving_id = saving_id;
      filters.push(`saving_id = '${saving_id}'`);
    }
    if (category_id){
      queryParams.category_id = category_id;
      filters.push(`saving_id IN (SELECT id FROM savings WHERE category_id = '${category_id}')`);
    }
    if (month){
      queryParams.month = month;
      filters.push(`month = '${month}'`);
    } 
    
    const queryString = filters.length > 0 ? ` WHERE ${filters.join(' AND ')}` : '';
    const contributions = await SQL_GET_CONTRIBUTIONS(queryParams).extend(queryString, queryParams).many();
    res.json(contributions);
  });
};
