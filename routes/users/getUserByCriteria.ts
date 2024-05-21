import { Router, Response } from 'express';
import { sql } from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/authorization';
import { GetUserInterface, TargetParamInterface } from './types';

const SQL_GET_USER_BY_CRITERIA = sql<Record<string,never>,  GetUserInterface>(`
  SELECT 
    users.id, 
    users.full_name, 
    users.role, 
    users.gender, 
    user_contact_details.id_type, 
    user_contact_details.id_number, 
    user_contact_details.phone_number, 
    users.created_at
  FROM 
    users
  LEFT JOIN 
    user_contact_details ON users.id = user_contact_details.id
`);

export default (router: Router) => {
  router.get<string, TargetParamInterface, GetUserInterface, Record<string,never>,Record<string,never>>(
    '/:targetUser', 
    authMiddleware(), 
    async (req, res: Response) => {
      const  targetUser = req.params.targetUser;
      const filters: string[] = [];
      const filterArgs: Record<string, string | number> = {};
      const isStandardUser = req.user!.role === 'User';
      
      if (targetUser === 'me') { //get logged in user
        filterArgs.loggedInUserId = req.user!.id;
        filters.push(`users.id = :loggedInUserId`);
      } else if (/^\+254\d{9}$/.test(targetUser)) { //get user by phone no
        if (isStandardUser) {
          throw new HttpError(403, 'Forbidden');
        }
        filterArgs.phoneNumber = targetUser;
        filters.push(`phone_number = :phoneNumber`);
      } else if (/^[0-9]+$/.test(targetUser)) { //get user by id number
        if (isStandardUser) {
          throw new HttpError(403, 'Forbidden');
        }
        filterArgs.idNumber = targetUser;
        filters.push(`id_number = :idNumber`);
      } else if (/^[A-Za-z\s]+$/.test(targetUser)) { //get user by full name
        if (isStandardUser) {
          throw new HttpError(403, 'Forbidden');
        }
        filterArgs.fullName = targetUser;
        filters.push(`LOWER(full_name) = LOWER(:fullName)`);
      } else {
        throw new HttpError(400, 'Bad request');
      }

      const query = SQL_GET_USER_BY_CRITERIA({});
      
      if (filters.length > 0) query.extend(`WHERE ${filters.join(' AND ')}`, filterArgs);
      query.extend('LIMIT 15', {});
      const users = await query.many();
      res.json(users);
    });
};