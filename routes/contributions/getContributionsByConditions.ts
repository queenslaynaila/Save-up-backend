import { Router, Response } from 'express';
import { z } from 'zod';
import { sql } from '../../db';
import { ContributionSchema } from '../../types';
import authMiddleware from '../../middleware/auth';
import { HttpError } from '../../middleware/errorMiddleware';

const UUIDSCHEMA = z.string().uuid();
const SQL_GET_CONTRIBUTIONS = sql<{ user_id?: string; month?: string }, ContributionSchema>(
  `SELECT * FROM contributions `
);

export default (router: Router) => {
  router.get<
  string,
  { contributionsIdentifier: string },
  ContributionSchema,
  Record<string, never>,
  { category_id?: string; month?: string; saving_id?: string }
  >('/:contributionsIdentifier', authMiddleware(), async (req, res: Response) => {
    const { contributionsIdentifier } = req.params;
    const { category_id, month, saving_id } = req.query;
    const filterArgs: Record<string, string> = {};
    const filters: string[] = [];
    const loggedInUserId = req.user!.id;
    const isStandardUser = req.user?.role === 'User';

    if (contributionsIdentifier === 'me') {
      filterArgs.loggedInUserId = loggedInUserId;
      filters.push(`saving_id IN (SELECT id FROM savings WHERE user_id = :loggedInUserId)`);
    } else if (contributionsIdentifier === 'all') {
      if (isStandardUser) {
        throw new HttpError(403, 'Unauthorized');
      }
    } else if (UUIDSCHEMA.parse(contributionsIdentifier)) {
      if (isStandardUser) {
        throw new HttpError(401, 'Unauthorized');
      }
      filterArgs.contributionsIdentifier = contributionsIdentifier;
      filters.push(
        `saving_id IN (SELECT id FROM savings WHERE user_id = :contributionsIdentifier)`
      );
    } else {
      throw new HttpError(400, 'Bad request');
    }

    if (saving_id) {
      filterArgs.saving_id = saving_id;
      filters.push(`saving_id = :saving_id`);
    }
    if (category_id) {
      filterArgs.category_id = category_id;
      filters.push(`saving_id IN (SELECT id FROM savings WHERE category_id = :category_id)`);
    }
    if (month) {
      filterArgs.month = month;
      filters.push(`month = '${month}'`);
    }

    const query = SQL_GET_CONTRIBUTIONS({});
    if (filters.length > 0) query.extend(`WHERE ${filters.join(' AND ')}`, filterArgs);
    query.extend('LIMIT 15', {});
    const contributions = await query.many();
    res.json(contributions);
  });
};
