import { Router } from 'express';
import { sql } from '../../db';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/authorization';
import isStandardUser from '../../middleware/isStandardUser';
import {  UserType, UserByEntityType, UserQueryParams  } from './types';

const SQL_GET_USER_BY_CRITERIA = sql<Record<string,never>,  UserType>(`
  SELECT 
    users.id, 
    user_contact_details.id_type, 
    user_contact_details.id_number,
    users.full_name, 
    users.role, 
    users.gender, 
    user_contact_details.phone_number,  
    users.created_at
  FROM 
    users
  LEFT JOIN 
    user_contact_details ON users.id = user_contact_details.id
`);

export default (router: Router) => {
  router.get<string, UserByEntityType,  UserType[], Record<string,never>, UserQueryParams>(
    '/:entity', 
    authMiddleware(), 
    async (req, res) => {
      const  targetUser = req.params.entity;
      const { full_name } = req.query;  

      const filters: string[] = [];
      const filterArgs: Record<string, string | number> = {};

      if (!/^me$|^\+254\d{9}$|^[0-9]+$/.test(targetUser)) {
        throw new HttpError(400);
      }

      if (targetUser === 'me') {
        filterArgs.loggedInUserId = req.user!.id;
        filters.push(`users.id = :loggedInUserId`);
      } else if (!isStandardUser(req.user!.role)) { 
        //restrict search by phone no and id number to admin users only
        if (/^\+254\d{9}$/.test(targetUser)) {
          filterArgs.phoneNumber = targetUser;
          filters.push(`user_contact_details.phone_number = :phoneNumber`);
        } else if (/^[0-9]+$/.test(targetUser)) {
          filterArgs.idNumber = targetUser;
          filters.push(`user_contact_details.id_number = :idNumber`);
        }
      } else {
        throw new HttpError(403);
      }

      if (full_name) {
        filterArgs.fullName = full_name;
        filters.push(`users.full_name = :fullName`);
      }
    
      const query = SQL_GET_USER_BY_CRITERIA({});
      
      if (filters.length > 0) query.extend(`WHERE ${filters.join(' AND ')}`, filterArgs);
      query.extend('LIMIT 15', {});
      const users = await query.many();
      res.json(users);
    });
};