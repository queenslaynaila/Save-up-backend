import authMiddleware from '../../middleware/auth';
import { Router } from 'express';
import { sql } from '../../db';
import { UserRole, CategorySchema } from '../../types';

const SQL_GET_ALL_CATEGORIES = sql<Record<string, never>, CategorySchema>(
  `SELECT * FROM categories LIMIT 15`
);
export default (router: Router) => {
  router.get(
    '/all',
    authMiddleware({ roles: [UserRole.ADMIN, UserRole.MODERATOR] }),
    async (_, res) => {
      const categories = await SQL_GET_ALL_CATEGORIES({}).many();
      return res.json(categories);
    }
  );
};
