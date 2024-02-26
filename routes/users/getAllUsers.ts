import { Router } from 'express';
import authMiddleware from '../../middleware/auth';
import { UserRole } from '../../types';
import { sql } from '../../db';
import { UserSchema } from './index';
export default (router: Router) => {
  router.get(
    '/',
    authMiddleware({ roles: [UserRole.ADMIN, UserRole.MODERATOR] }),
    async (_, res) => {
      const SQL_GET_ALL = sql<Record<string, never>, UserSchema>(
        `SELECT * FROM users ORDER BY created_at `
      );
      const users = await SQL_GET_ALL({}).many();
      return res.json(users);
    }
  );
};
