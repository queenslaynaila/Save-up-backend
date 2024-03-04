import { Router, Request, Response } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';
import { UserSchema } from './index';

const baseQuery = `SELECT id, first_name, last_name, phone_number, role, created_at, updated_at FROM users `;
const SQL_GET_SAVINGS = (modifiedQuery: string) => sql<{ userId?: string; role?: string }, UserSchema>(modifiedQuery);

export default (router: Router) => {
  router.get('/:datarange', authMiddleware(), async (req: Request, res: Response) => {
    const userId = req.params.userId; 
    const queryParams: { userId?: string; role?: string; } = {};
    const filters: string[] = [];

    if (userId === 'me') {
      const loggedInUserId = req.user!.id; 
      queryParams.userId = loggedInUserId;
      filters.push(`user_id = '${loggedInUserId}'`);
    } else if (userId !== 'all') {
      filters.push(`user_id = :userId`);
      queryParams.userId = userId;
    }

    if (req.query.role) {
      queryParams.role = req.query.role as string;
      filters.push(`role = '${queryParams.role}'`);
    }
  
    // Construct the WHERE and And clause 
    let whereClause = '';
    if (filters.length > 0) {
      whereClause = ` WHERE ${filters.join(' AND ')}`;
    }
    const modifiedQuery = `${baseQuery}${whereClause}`;
    console.log(modifiedQuery);
    const savings = await SQL_GET_SAVINGS(modifiedQuery)(queryParams).many(); 
    res.json(savings);
  });
};
