import authMiddleware from '../../middleware/auth';
import { Router } from 'express';
import { sql } from '../../db';
import { UserRole ,CategorySchema } from '../../types';

export default (router: Router) => {
  router.get(
    '/all',
    authMiddleware({ roles: [UserRole.ADMIN, UserRole.MODERATOR] }),
    async (_, res) => {
      const query = `SELECT * FROM categories LIMIT 15`;
      const SQL_GET_ALL = sql<Record<string,never>, CategorySchema>(query);
      const categories = await SQL_GET_ALL({}).many();
      return res.json(categories);
    }
  );
};
