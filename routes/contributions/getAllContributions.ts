import { Router, Request, Response } from 'express';
import { sql } from '../../db';

import {ContributionSchema } from '../../types';
import authMiddleware from '../../middleware/auth';

const baseQuery = `SELECT * FROM contributions `;
const SQL_GET_CONTRIBUTIONS = (modifiedQuery: string) => sql<{ userId?: string; month?: string; }, ContributionSchema>(modifiedQuery);

export default (router: Router) => {
  router.get('/:contributionsIdentifier', authMiddleware(), async (req: Request, res: Response) => {
    const { contributionsIdentifier } = req.params; 
    const queryParams: { userId?: string; saving_id?: string; month: string } = { month: '' };
    const filters: string[] = [];

    if (contributionsIdentifier === 'me') {
      const loggedInUserId = req.user!.id;
      filters.push(` saving_id IN (SELECT id FROM savings WHERE user_id = '${loggedInUserId}') `);
      queryParams.userId = loggedInUserId;
    } else if (contributionsIdentifier !== 'all') {
      filters.push(`user_id = :userId`);
      queryParams.userId = contributionsIdentifier; 
    }
    if (req.query.saving_id) {
      queryParams.saving_id = req.query.saving_id as string;
      filters.push(`saving_id = '${queryParams.saving_id}'`);
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
    console.log(modifiedQuery)
    const contributions = await SQL_GET_CONTRIBUTIONS(modifiedQuery)(queryParams).many();
    res.json(contributions);
  });
};
