import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { sql } from '../../db';
import { savingInterface } from './index';
import authMiddleware from '../../middleware/auth';
import { convertToTitleCase, isValidValue } from '../../middleware/caseNormalization';
import { HttpError } from '../../middleware/errorMiddleware';

const UUIDSchema = z.string().uuid();
const ACCEPTED_STATUS_VALUES = ['In Progress', 'Dormant', 'Completed'];
const ACCEPTED_PRIORITY_VALUES = ['High', 'Intermediate', 'Low'];
const SQL_GET_SAVINGS = sql<{ userId?: string; priority?: string; status?: string; category_id?: string }, savingInterface>(`SELECT * FROM savings`);

export default (router: Router) => {
  router.get('/:savingsIdentifier', authMiddleware(), async (req: Request, res: Response) => {
    const { savingsIdentifier } = req.params;
    const { category_id, priority, status } = req.query as { status: string; category_id?: string; priority?: string };
    const queryParams: { user_id?: string; priority?: string; category_id?: string; status?: string } = {};
    const filters: string[] = [];

    const convertedStatus = status ? convertToTitleCase(status) : undefined;
    const convertedPriority = priority ? convertToTitleCase(priority) : undefined;
    const isStandardUser = req.user?.role === 'User';

    if (savingsIdentifier === 'me') {
      queryParams.user_id = req.user!.id;
      filters.push(`user_id = '${queryParams.user_id}'`);
    } else if (savingsIdentifier === 'all') {
      if (isStandardUser) {
        throw new HttpError(401, 'Unauthorized');
      }
    } else if (UUIDSchema.parse(savingsIdentifier)) {
      if (isStandardUser) {
        throw new HttpError(401, 'Unauthorized');
      }
      queryParams.user_id = savingsIdentifier;
      filters.push(`user_id = '${savingsIdentifier}'`);
    } else {
      throw new HttpError(400, 'Bad request');
    }

    if (category_id) {
      queryParams.category_id = category_id;
      filters.push(`category_id = '${category_id}'`);
    }
    if (convertedPriority && isValidValue(convertedPriority, ACCEPTED_PRIORITY_VALUES)) {
      queryParams.priority = convertedPriority;
      filters.push(`priority = '${convertedPriority}'`);
    }
    if (convertedStatus && isValidValue(convertedStatus, ACCEPTED_STATUS_VALUES)) {
      queryParams.status = convertedStatus;
      filters.push(`status = '${convertedStatus}'`);
    }

    const queryString = filters.length > 0 ? ` WHERE ${filters.join(' AND ')}` : '';
    const savings = await SQL_GET_SAVINGS(queryParams).extend(queryString, queryParams).many();
    res.json(savings);
  });
};
