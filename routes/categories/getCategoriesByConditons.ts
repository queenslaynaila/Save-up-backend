import authMiddleware from '../../middleware/auth';
import { z } from 'zod';
import { HttpError } from '../../middleware/errorMiddleware';
import { Router } from 'express';
import { sql } from '../../db';
import { CategorySchema } from '../../types';

const UUIDSCHEMA = z.string().uuid();
const SQL_GET_ALL_CATEGORIES = sql<Record<string, never>, CategorySchema>(
  `SELECT * FROM categories WHERE deleted_at IS NULL`
);

export default (router: Router) => {
  router.get<{ user_id: string }, CategorySchema[], Record<string, never>, Record<string, never>>(
    '/:user_id',
    authMiddleware(),
    async (req, res) => {
      const { user_id: categoryIdentifier } = req.params;
      const isStandardUser = req.user?.role === 'User';
      const loggedInUserId = req.user!.id;
      const query = SQL_GET_ALL_CATEGORIES({});

      if (categoryIdentifier === 'me') {
        query.extend(`AND user_id = :loggedInUserId `, { loggedInUserId });
      } else if (categoryIdentifier === 'all') {
        if (isStandardUser) {
          throw new HttpError(401, 'Unauthorized');
        }
      } else if (categoryIdentifier === 'system') {
        if (isStandardUser) {
          throw new HttpError(401, 'Unauthorized');
        }
        query.extend(`AND user_id = 1`, {});
      } else if (UUIDSCHEMA.parse(categoryIdentifier)) { //get categories for a specific user
        if (isStandardUser && loggedInUserId.toString() !== categoryIdentifier.toString()) {
          throw new HttpError(401, 'Unauthorized');
        }
        query.extend(`AND user_id = :categoryIdentifier`, { categoryIdentifier });
      } else {
        throw new HttpError(400, 'Bad request');
      }

      query.extend('LIMIT 15', {});
      const categories = await query.many();
      res.json(categories);
    });
};
