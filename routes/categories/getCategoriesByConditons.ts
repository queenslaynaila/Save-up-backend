import authMiddleware from '../../middleware/auth';
import { z } from 'zod';
import { HttpError } from '../../middleware/errorMiddleware';
import { Router } from 'express';
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
      query.extend(`WHERE user_id = :loggedInUserId OR user_id = 1`, { loggedInUserId });
    } else if (categoryIdentifier === 'all') {
      if (isStandardUser) {
        throw new HttpError(401, 'Unauthorized');
      }
    } else if (categoryIdentifier === 'system') {
      if (isStandardUser) {
        throw new HttpError(401, 'Unauthorized');
      }
      query.extend(`WHERE user_id = 1`, { });
    } else if (UUIDSCHEMA.parse(categoryIdentifier)) {
      if (isStandardUser && loggedInUserId !== categoryIdentifier) {
        throw new HttpError(401, 'Unauthorized');
      }
      query.extend(`WHERE user_id = :categoryIdentifier`, {categoryIdentifier});
    } else {
      throw new HttpError(400, 'Bad request');
    }

    query.extend('LIMIT 15', {});
    const categories = await query.many();
    res.json(categories);
  });
};
