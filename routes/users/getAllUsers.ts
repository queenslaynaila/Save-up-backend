import { Router } from 'express';
import authMiddleware from '../../middleware/auth';
import { UserRole } from '../../types';
import { sql } from '../../db';
import { UserSchema } from './index';

const SQL_GET_ALL_USERS = sql<Record<string,never>, UserSchema>(`SELECT id, first_name, last_name, phone_number, role, created_at, updated_at FROM users ORDER BY created_at`);

export default (router: Router) => {
  router.get(
    '/',
    authMiddleware({ roles: [UserRole.ADMIN, UserRole.MODERATOR] }),
    async (_, res) => {
      const users = await SQL_GET_ALL_USERS({}).many();
      return res.json(users);
    }
  );
};
