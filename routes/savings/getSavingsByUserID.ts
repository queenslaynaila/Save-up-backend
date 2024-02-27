import authMiddleware from '../../middleware/auth';
import { hasPermission } from '../../middleware/hasPermission';
import { Router } from 'express';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';
import { savingInterface } from './index';
import { getSavingsQueryParamsSchema } from '../../types';

export default (router: Router) => {
  router.get('/', authMiddleware(), async (req, res) => {
    const validationResult = getSavingsQueryParamsSchema.safeParse(req.query);
    if (!validationResult.success) {
      throw new HttpError(400, 'Invalid query parameters');
    }
    const { user_id, priority, status } = validationResult.data;

    const userId = req.user!.id;
    const logged_in_user_role = req.user!.role;
    if (!hasPermission(req, userId, logged_in_user_role)) {
      throw new HttpError(403, 'Unauthorized');
    }

    let query = 'SELECT * FROM savings WHERE user_id = :user_id';
    const values: { [key: string]: string } = { user_id };

    if (priority) {
      query += ' AND priority = :priority';
      values.priority = priority;
    }

    if (status) {
      query += ' AND status = :status';
      values.status = status;
    }

    query += ' LIMIT 15';

    const SQL_GET_SAVINGS = sql<{ user_id: string; priority?: string; status?: string }, savingInterface>(query);
    const result = await SQL_GET_SAVINGS({ user_id, priority, status }).many();
    return res.json(result);
   
  });
};
