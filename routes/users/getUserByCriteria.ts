import { Router, Response } from 'express';
import { sql } from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
import { hasPermission } from '../../middleware/hasPermission';
import { convertToTitleCase, isValidValue } from '../../middleware/caseNormalization';
import authMiddleware from '../../middleware/authorization';
import { GetUserInterface, GetUserQueryInterface } from './types';
import { idSchema, IdParamInterface } from '../../globalTypes/index';

const SQL_GET_ALL_USERS = sql<Record<string,never>,  GetUserInterface>(`
  SELECT id, full_name, role, gender, created_at FROM users
`);

const ACCEPTED_ROLES = ['User', 'Admin', 'Moderator'];

export default (router: Router) => {
  router.get<string, IdParamInterface, GetUserInterface, Record<string,never>, GetUserQueryInterface>(
    '/:targetUser', 
    authMiddleware(), 
    async (req, res: Response) => {

      const  targetUser = req.params.id;
      const { role } = req.query;
      const filters: string[] = [];
      const filterArgs: Record<string, string | number> = {};
      const isStandardUser = req.user!.role === 'User';
      const convertedRole = role ? convertToTitleCase(role) : '';

      if (targetUser === 'me') {
        filterArgs.loggedInUserId = req.user!.id;
        filters.push(`id = :loggedInUserId`);
      } else if (targetUser === 'all') {
        if (isStandardUser) {
          throw new HttpError(403, 'Forbidden');
        }
      } else if (idSchema.safeParse(parseInt(targetUser)).success) {
        if (!hasPermission(req, parseInt(targetUser))) {
          throw new HttpError(403, 'Forbidden');
        }
        filterArgs.userId = targetUser;
        filters.push(`id = :userId`);
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