import { Router, Request, Response } from 'express';
import { sql } from '../../db';
import { savingInterface } from './index';
import authMiddleware from '../../middleware/auth';

const ACCEPTED_STATUS_VALUES = ['In Progress', 'Dormant', 'Completed'];
const ACCEPTED_PRIORITY_VALUES = ['High', 'Intermediate', 'Low'];
const baseQuery = `SELECT * FROM savings `;
const SQL_GET_SAVINGS = (modifiedQuery: string) => sql<{ userId?: string; priority?: string; status?: string; category_id?: string }, savingInterface>(modifiedQuery);
const isValidValue = (value: string | undefined, acceptedValues: string[]): boolean => {
  return value !== undefined && acceptedValues.includes(value);
};

export default (router: Router) => {
  router.get('/:savingsIdentifier', authMiddleware(), async (req: Request, res: Response) => {
    const { savingsIdentifier } = req.params; 
    const queryParams: { userId?: string; priority?: string; category_id?: string; status: string } = { status: '' };
    const filters: string[] = [];

    if (savingsIdentifier === 'me') {
      const loggedInUserId = req.user!.id;
      queryParams.userId = loggedInUserId;
      filters.push(`user_id = '${loggedInUserId}'`);
    } else if (savingsIdentifier !== 'all') {
      filters.push(`user_id = :userId`);
      queryParams.userId = savingsIdentifier; 
    }
    if (req.query.category_id) {
      queryParams.category_id = req.query.category_id as string;
      filters.push(`category_id = '${queryParams.category_id}'`);
    }
    if (req.query.priority) {
      if (isValidValue(req.query.priority as string, ACCEPTED_PRIORITY_VALUES)) {
        queryParams.priority = (req.query.priority as string).toLowerCase()
        filters.push(`priority = '${queryParams.priority}'`);
      }
    }
    if (req.query.status) {
      if (isValidValue(req.query.status as string, ACCEPTED_STATUS_VALUES)) {
        queryParams.status = (req.query.status as string).toLowerCase();
        filters.push(`status = '${queryParams.status}'`);
      }
    }

    let whereClause = '';
    if (filters.length > 0) {
      whereClause = ` WHERE ${filters.join(' AND ')}`;
    }

    const modifiedQuery = `${baseQuery}${whereClause}`;
    const expenses = await SQL_GET_SAVINGS(modifiedQuery)(queryParams).many();
    res.json(expenses);
  });
};
