import authMiddleware from '../../middleware/auth';
import { UserRole } from '../../types';
import { Router } from 'express';
import { sql } from '../../db';
import { savingInterface } from './index';

export default (router: Router) => {
  router.get(
    '/all',
    authMiddleware({ roles: [UserRole.ADMIN, UserRole.MODERATOR] }),
    async (_, res) => {
      const query = `SELECT * FROM savings ORDER BY created_at `;
      const SQL_GET_EXPENSES = sql<Record<string, never>, savingInterface>(query);
      const savings = await SQL_GET_EXPENSES({}).many();
      return res.json(savings);
    }
  );
};
