import authMiddleware from '../../middleware/auth';
import { hasPermission } from '../../middleware/hasPermission';
import { Router } from 'express';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';
import { savingInterface } from './index';

export default (router: Router) => {
  router.get('/', authMiddleware(), async (req, res) => {
    const { user_id, priority, status } = req.query as {
      user_id: string;
      priority?: string;
      status?: string;
    };

    const logged_in_user_role = req.user!.role;
    if (!hasPermission(req, user_id, logged_in_user_role)) {
      throw new HttpError(403, 'Unauthorized access');
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

    const SQL_GET_SAVINGS = sql<{ user_id: string; priority?: string; status?: string }, savingInterface[]>(query);
    const result = await SQL_GET_SAVINGS({ user_id, priority, status }).many();
    return res.json(result);
   
  });
};
