import authMiddleware from '../../middleware/auth';
import { UserRole } from '../../types';
import { Router } from 'express';
import { sql } from '../../db';
import { savingInterface } from './index';

export default (router: Router) => {
  router.get(
    '/all',
    authMiddleware({ roles: [UserRole.ADMIN, UserRole.MODERATOR] }),
    async (req, res) => {
      const SQL_GET_ALL = sql<Record<string, never>, savingInterface>(
        `SELECT * FROM savings ORDER BY created_at `
      );
      const savings = await SQL_GET_ALL({}).many();
      return res.json(savings);
    }
  );
};
