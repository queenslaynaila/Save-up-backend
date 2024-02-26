import authMiddleware from '../../middleware/auth';
import { UserRole,ContributionSchema } from '../../types';
import { Router } from 'express';
import { sql } from '../../db';

export default (router: Router) => {
  router.get(
    '/all',
    authMiddleware({ roles: [UserRole.ADMIN, UserRole.MODERATOR] }),
    async (req, res) => {
      const query ='SELECT * FROM contributions ORDER BY created_at';
      const SQL_GET_ALL = sql<Record<string,never>, ContributionSchema>(query);
      const contributions = await SQL_GET_ALL({}).many();
      return res.json(contributions);
    }
  );
};
