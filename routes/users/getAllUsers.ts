import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';
import { UserSchema } from './index';

const UUIDSCHEMA = z.string().uuid();
const SQL_GET_SAVINGS =  sql<{ userId?: string; role?: string }, UserSchema>('SELECT id, first_name, last_name, phone_number, role, created_at, updated_at FROM users ');

export default (router: Router) => {
  router.get('/:userIdentifier', authMiddleware(), async (req: Request, res: Response) => {
    const { userIdentifier } = req.params;
    const queryParams: { userId?: string; role?: string; } = {};
    const filters: string[] = [];
    const isStandardUser = req.user?.role === 'User';

    if (userIdentifier === 'me') {
      const loggedInUserId = req.user!.id; 
      queryParams.userId = loggedInUserId;
      filters.push(`user_id = '${loggedInUserId}'`);
    } else if (userIdentifier !== 'all') {
      if (isStandardUser) {
        throw new HttpError(401, 'Unauthorized');
      }else if (UUIDSCHEMA.parse(userIdentifier)) {
        if (isStandardUser) {
          throw new HttpError(401, 'Unauthorized');
        }
        queryParams.userId = userIdentifier;
        filters.push(`user_id = '${userIdentifier}'`);
      } else {
        throw new HttpError(400, 'Bad request');
      }
    }

    if (req.query.role) {
      queryParams.role = req.query.role as string;
      filters.push(`role = '${queryParams.role}'`);
    }
  
    const queryString = filters.length > 0 ? ` WHERE ${filters.join(' AND ')}` : '';
    const users = await SQL_GET_SAVINGS(queryParams).extend(queryString, queryParams).many(); 
    res.json(users);
  });
};
