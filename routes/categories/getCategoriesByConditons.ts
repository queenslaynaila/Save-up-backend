import authMiddleware from '../../middleware/auth';
import { z } from 'zod';
import { HttpError } from '../../middleware/errorMiddleware';
import { Router, Request, Response } from 'express';
import { sql } from '../../db';
import { CategorySchema } from '../../types';

const UUIDSCHEMA = z.string().uuid();
const SQL_GET_ALL_CATEGORIES = sql<Record<string, never>, CategorySchema>(
  `SELECT * FROM categories`
);

export default (router: Router) => {
  router.get<
  { user_id: string },
  CategorySchema[],
  Record<string, never>,
  Record<string, never>
  >('/:user_id', authMiddleware(), async (req, res) => {
    const { user_id: categoryIdentifier } = req.params;
    const isStandardUser = req.user?.role === 'User';
    const loggedInUserId = req.user!.id;


    const query = SQL_GET_ALL_CATEGORIES({});

    if (categoryIdentifier === 'me') {
      query.extend(`WHERE user_id = :loggedInUserId OR user_id IS NULL`, { loggedInUserId });
    } else if (categoryIdentifier === 'all') {
      if (isStandardUser) {
        throw new HttpError(401, 'Unauthorized');
      }
    } else if (categoryIdentifier === 'system') {
      if (isStandardUser) {
        throw new HttpError(401, 'Unauthorized');
      }
      filters.push(`user_id IS NULL`);
    } else if (UUIDSCHEMA.parse(categoryIdentifier)) {
      if (isStandardUser) {
        throw new HttpError(401, 'Unauthorized');
      }
      filterArgs.categoryIdentifier = categoryIdentifier;
      filters.push(`user_id = :categoryIdentifier`);
    } else {
      throw new HttpError(400, 'Bad request');
    }

    if (filters.length > 0) query.extend(`WHERE ${filters.join(' AND ')}`, filterArgs);
    query.extend('LIMIT 15', {});
    const categories = await query.many();
    res.json(categories);
  });
};
