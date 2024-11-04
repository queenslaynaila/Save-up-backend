import { Router } from 'express';
import { z } from 'zod';
import { sql } from '../../db';
import validateRequest from '../../middleware/validationMiddleware';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/authorization';
import isStandardUser from '../../middleware/isStandardUser';
import { UserSafe } from './login';
import { userContactDetailsSchema } from './types';

const SQL_GET_USER_BY_CRITERIA = sql<Record<string, never>, UserSafe>(`
  SELECT 
    users.id, 
    users.id_type, 
    users.id_number,
    user_contact_details.full_name, 
    users.role, 
    users.gender, 
    user_contact_details.phone_number,  
    users.created_at
  FROM 
    users
  LEFT JOIN 
    user_contact_details ON users.id = user_contact_details.id
`);

const PHONE_REGEX = /^\+254\d{9}$/;
const ID_REGEX = /^\d{6,13}$/;
const PASSPORT_REGEX = /^[A-Za-z0-9]{9,16}$/i;

const userQuerySchema = userContactDetailsSchema.pick({
  full_name: true,
  phone_number: true
}).partial();
type UserSearchParams = z.infer<typeof userQuerySchema>;

export default (router: Router) => {
  router.get<{ entity: string }, UserSafe[], Record<string, never>, UserSearchParams>(
    '/:entity',
    authMiddleware(),
    validateRequest({ query: userQuerySchema }),
    async (req, res) => {
      const targetUser = req.params.entity;
      const { full_name, phone_number } = req.query;

      const filters: string[] = [];
      const filterArgs: Record<string, string | number> = {};

      if (targetUser !== 'me' && isStandardUser(req.user!.role)) {
        throw new HttpError(403);
      }

      if (targetUser === 'me') {
        filterArgs.loggedInUserId = req.user!.id;
        filters.push('users.id = :loggedInUserId');
      } else if (ID_REGEX.test(targetUser)) {
        filterArgs.idNumber = targetUser;
        filters.push('users.id_number = :idNumber');
      } else if (PHONE_REGEX.test(targetUser)) {
        filterArgs.phoneNumber = targetUser;
        filters.push('user_contact_details.phone_number = :phoneNumber');
      } else if (PASSPORT_REGEX.test(targetUser)) {
        filterArgs.idNumber = targetUser;
        filters.push('users.id_number = :idNumber');
      } else {
        throw new HttpError(400);
      }

      if (full_name) {
        filterArgs.fullName = full_name;
        filters.push('user_contact_details.full_name = :fullName');
      }

      if (phone_number) {
        filterArgs.phoneNumber = phone_number;
        filters.push('user_contact_details.phone_number = :phoneNumber');
      }

      const query = SQL_GET_USER_BY_CRITERIA({});

      if (filters.length > 0) query.extend(`WHERE ${filters.join(' AND ')}`, filterArgs);
      query.extend('LIMIT 15', {});
      const users = await query.many();
      res.json(users);
    }
  );
};
