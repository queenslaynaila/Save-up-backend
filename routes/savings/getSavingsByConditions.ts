import { Router, Response } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';
import { HttpError } from '../../middleware/errorMiddleware';
import { SavingInterface, ID_SCHEMA } from '../../types';

const SQL_GET_CONTRIBUTIONS = sql<Record<string, never>, SavingInterface>(
  `SELECT * FROM savings `
);

export default (router: Router) => {
  router.get<string,{ savingId: string },SavingInterface,Record<string, never>,{ category_id?: string; goal_id?: string }
  >('/:savingIdentifier', 
    authMiddleware(), 
    async (req, res: Response) => {
      const { savingId } = req.params;
      const { category_id, goal_id } = req.query;
      const filterArgs: Record<string, string> = {};
      const filters: string[] = [];
      const loggedInUserId = req.user!.id;
      const isStandardUser = req.user?.role === 'User';

      if (savingId === 'me') {
        filterArgs.loggedInUserId = loggedInUserId.toString();
        filters.push(`user_id = :loggedInUserId`);
      } else if (savingId === 'all') {
        if (isStandardUser) {
          throw new HttpError(403, 'Forbidden');
        }
      } else if(ID_SCHEMA.parse(parseInt(savingId))) {
        if (isStandardUser && req.user!.id !== parseInt(savingId)) {
          throw new HttpError(403, 'Forbidden');
        }
        filterArgs.savingId = savingId;
        filters.push(`user_id = :savingId`);
      } else {
        throw new HttpError(400, 'Bad request');
      }

      if (goal_id) {
        filterArgs.goal_id = goal_id.toString();
        filters.push(`goal_id = :goal_id`);
      }
      if (category_id) {
        filterArgs.category_id = category_id.toString()
        filters.push(`saving_id IN (SELECT id FROM savings WHERE category_id = :category_id)`);
      }

      const query = SQL_GET_CONTRIBUTIONS({});
      if (filters.length > 0) query.extend(`WHERE ${filters.join(' AND ')}`, filterArgs);
      query.extend('LIMIT 15', {});
      const savings = await query.many();
      res.json(savings);
    });
};
