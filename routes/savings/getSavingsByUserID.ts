import authMiddleware from '../../middleware/auth';
import { z } from 'zod';
import { hasPermission } from '../../middleware/hasPermission';
import { Router } from 'express';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';
import { savingInterface } from './index';
import { getSavingsQueryParamsSchema } from '../../types';

let baseQuery = `SELECT * FROM savings WHERE user_id = :user_id`;
const SQL_GET_SAVINGS = sql<z.infer<typeof getSavingsQueryParamsSchema>, savingInterface>(baseQuery);

export default (router: Router) => {
  router.get('/', authMiddleware(), async (req, res) => {

    const validationResult = getSavingsQueryParamsSchema.safeParse(req.query);
    if (!validationResult.success) {
      throw new HttpError(400, 'Invalid query parameters');
    }
    const { user_id, priority, status } = validationResult.data;

    const loggedInUserId = req.user!.id;
    const userRole = req.user!.role;
    if (!hasPermission(req, loggedInUserId, userRole)) {
      throw new HttpError(403, 'Unauthorized');
    }

    const values: { user_id: string; priority?: string; status?: string } = { user_id: user_id }; 
      
    if (priority) {
      baseQuery += ' AND priority = :priority';
      values.priority = priority;
    }
    if (status) {
      baseQuery += ' AND status = :status';
      values.status = status;
    }

    baseQuery += ' LIMIT 15';
    const savings = await SQL_GET_SAVINGS(values).many();
    return res.json(savings);
  });
};
