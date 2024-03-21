import { Router, Response } from 'express';
import { sql } from '../../db';
import { ContributionSchema, ID_SCHEMA } from '../../types';
import authMiddleware from '../../middleware/auth';
import { HttpError } from '../../middleware/errorMiddleware';

const SQL_GET_CONTRIBUTIONS = sql<{ user_id?:number; }, ContributionSchema>(
  `SELECT * FROM contributions `
);

export default (router: Router) => {
  router.get<string,{ contributionId: string },ContributionSchema,Record<string, never>,{ category_id?: string; saving_id?: string }
  >('/:contributionId', 
    authMiddleware(), 
    async (req, res: Response) => {
      const { contributionId } = req.params;
      const { category_id, saving_id } = req.query;
      const filterArgs: Record<string, string> = {};
      const filters: string[] = [];
      const loggedInUserId = req.user!.id;
      const isStandardUser = req.user?.role === 'User';

      if (contributionId === 'me') {
        filterArgs.loggedInUserId = loggedInUserId.toString();
        filters.push(`user_id = :loggedInUserId`);
      } else if (contributionId === 'all') {
        if (isStandardUser) {
          throw new HttpError(403, 'Unauthorized');
        }
      } else if(ID_SCHEMA.parse(parseInt(contributionId))) {
        if (isStandardUser && req.user!.id !== parseInt(contributionId)) {
          throw new HttpError(401, 'Unauthorized');
        }
        filterArgs.contributionId = contributionId;
        filters.push(`user_id = :contributionId`);
      } else {
        throw new HttpError(400, 'Bad request');
      }

      if (saving_id) {
        filterArgs.saving_id = saving_id.toString();
        filters.push(`saving_id = :saving_id`);
      }
      if (category_id) {
        filterArgs.category_id = category_id.toString()
        filters.push(`saving_id IN (SELECT id FROM savings WHERE category_id = :category_id)`);
      }

      const query = SQL_GET_CONTRIBUTIONS({});
      if (filters.length > 0) query.extend(`WHERE ${filters.join(' AND ')}`, filterArgs);
      query.extend('LIMIT 15', {});
      const contributions = await query.many();
      res.json(contributions);
    });
};
