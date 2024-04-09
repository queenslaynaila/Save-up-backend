import authMiddleware from '../../middleware/auth';
import { HttpError } from '../../middleware/errorMiddleware';
import { Router } from 'express';
import { sql } from '../../db';
import { CategoryInterface,ID_SCHEMA} from '../../types';

const SQL_GET_ALL_CATEGORIES = sql<Record<string, never>, CategoryInterface>(
  `SELECT * FROM categories WHERE deleted_at IS NULL`
);

export default (router: Router) => {
  router.get<{  targetCategory: string }, CategoryInterface[], Record<string, never>, Record<string, never>>(
    '/:targetCategory',
    authMiddleware(),
    async (req, res) => {
      const { targetCategory} = req.params;
      const isStandardUser = req.user?.role === 'User';
      const loggedInUserId = req.user!.id;
      const query = SQL_GET_ALL_CATEGORIES({});

      if (targetCategory === 'me') {
        query.extend(`AND user_id = :loggedInUserId `, { loggedInUserId });
      } else if (targetCategory === 'all') {
        if (isStandardUser) {
          throw new HttpError(403, 'Forbidden');
        }
      } else if (ID_SCHEMA.safeParse(parseInt(targetCategory)).success) {
        if (isStandardUser && loggedInUserId.toString() !== targetCategory.toString()) {
          throw new HttpError(403, 'Forbidden');
        }
        query.extend(`AND user_id = :categoryIdentifier`, { targetCategory });
      } else {
        throw new HttpError(400, 'Bad request');
      }
      query.extend('LIMIT 15', {});
      const categories = await query.many();
      res.json(categories);
    });
};
