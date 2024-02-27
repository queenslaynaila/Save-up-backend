import authMiddleware from '../../middleware/auth';
import { UserRole } from '../../types';
import { Router } from 'express';
import { sql } from '../../db';
import { savingInterface } from './index';

const SQL_GET_ALL_SAVINGS = sql<Record<string, never>, savingInterface>(
  `SELECT * FROM savings ORDER BY created_at`
);

export default (router: Router) => {
  router.get(
    '/all',
    authMiddleware({ roles: [UserRole.ADMIN, UserRole.MODERATOR] }),
    async (_, res) => {
      const savings = await SQL_GET_ALL_SAVINGS({}).many();
      return res.json(savings);
    }
  );
};
