import authMiddleware from '../../middleware/auth';
import { UserRole } from '../../types';
import { Router } from 'express';
import { sql } from '../../db';
import { ExtendedExpenseInterface } from '../../types';

const SQL_GET_EXPENSES = sql<Record<string, never>, ExtendedExpenseInterface>(`
  SELECT * FROM expenses
  ORDER BY created_at DESC
`);

export default (router: Router) => {
  router.get(
    '/all',
    authMiddleware({ roles: [UserRole.ADMIN, UserRole.MODERATOR] }),
    async (_req, res) => {
      const expenses = await SQL_GET_EXPENSES({}).many();
      return res.json(expenses);
    }
  );
};
