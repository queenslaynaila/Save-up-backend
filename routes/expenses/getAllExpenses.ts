import authMiddleware from '../../middleware/auth';
import { UserRole } from '../../types';
import { Router } from 'express';
import { sql } from '../../db';

export default (router: Router) => {
  router.get(
    '/all',
    authMiddleware({ roles: [UserRole.ADMIN, UserRole.MODERATOR] }),
    async (_req, res) => {
      const query = ` SELECT * FROM expenses ORDER BY created_at  `;
      const SQL_GET_EXPENSES = sql<Record<string, never>, { id: string; created_at: string; updated_at: string; month: string }>(query);
      const expenses = await SQL_GET_EXPENSES({}).many();
      return res.json(expenses);
    }
  );
};
