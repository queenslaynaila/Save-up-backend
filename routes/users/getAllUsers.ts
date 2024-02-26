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
      const query = `SELECT id, first_name, last_name, phone_number, role, created_at, updated_at FROM users ORDER BY created_at`
      const SQL_GET_ALL = sql<Record<string,never>, UserSchema>(query);
      const users = await SQL_GET_ALL({}).many();
      return res.json(users);
    }
  );
};
