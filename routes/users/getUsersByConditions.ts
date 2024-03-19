import { Response, Router } from 'express';
import { z } from 'zod';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';
import { convertToTitleCase, isValidValue } from '../../middleware/caseNormalization';
import authMiddleware from '../../middleware/auth';
import { UserSchema } from './index';

const UUID_SCHEMA = z.string();
const SQL_GET_ALL_USERS = sql<Record<string, never>, UserSchema>(`
  SELECT id, first_name, last_name, phone_number, role, created_at, updated_at FROM users
`);
const ACCEPTED_ROLES = ['User', 'Admin', 'Moderator'];

export default (router: Router) => {
  router.get<string,{ userIdentifier: string },UserSchema,Record<string, never>,{ role?: string }>(
    '/:userIdentifier', 
    authMiddleware(), 
    async (req, res: Response) => {
      const { userIdentifier } = req.params;
      const { role } = req.query;
      const filters: string[] = [];
      const filterArgs: Record<string, string> = {};
      const isStandardUser = req.user?.role === 'User';
      const convertedRole = role ? convertToTitleCase(role) : '';

      if (userIdentifier === 'me') {
        filterArgs.loggedInUserId = req.user!.id.toString();
        filters.push(`id = :loggedInUserId`);
      } else if (userIdentifier === 'all') {
        if (isStandardUser) {
          throw new HttpError(401, 'Unauthorized');
        }
      } else if (UUID_SCHEMA.safeParse(userIdentifier).success) {
        if (isStandardUser  && filterArgs.loggedInUserId !== userIdentifier) {
          throw new HttpError(401, 'Unauthorized');
        }
        filterArgs.userIdentifier = userIdentifier;
        filters.push(`id = :userIdentifier`);
      } else {
        throw new HttpError(400, 'Bad request');
      }

      if (convertedRole && isValidValue(convertedRole, ACCEPTED_ROLES)) {
        filterArgs.role = convertedRole;
        filters.push(`role = :role`);
      }
      const query = SQL_GET_ALL_USERS({});
      if (filters.length > 0) query.extend(`WHERE ${filters.join(' AND ')}`, filterArgs);
      query.extend('LIMIT 15', {});
      const users = await query.many();
      res.json(users);
    });
};
