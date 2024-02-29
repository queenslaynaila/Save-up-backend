import authMiddleware from '../../middleware/auth';
import { z } from 'zod';
import { hasPermission } from '../../middleware/hasPermission';
import { Router } from 'express';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';
import { savingInterface } from './index';
import { getSavingsQueryParamsSchema } from '../../types';

const SQL_GET_SAVINGS = (query: string) => sql<z.infer<typeof getSavingsQueryParamsSchema>, savingInterface>(query);

export default (router: Router) => {
  router.get('/', authMiddleware(), async (req, res) => {
    const validationResult = getSavingsQueryParamsSchema.safeParse(req.query);
    if (!validationResult.success) {
      throw new HttpError(400, 'Invalid query parameters');
    }
    const { user_id, priority, status } = validationResult.data;
    const userRole = req.user!.role;
    if (!hasPermission(req, user_id, userRole)) {
      throw new HttpError(403, 'Unauthorized');
    }

    let query = `SELECT * FROM savings WHERE user_id = :user_id`;
    const values: { user_id: string; priority?: string; status?: string } = { user_id };

    if (priority) {
      query += ' AND priority = :priority';
      values.priority = priority;
    }
    if (status) {
      query += ' AND status = :status';
      values.status = status;
    }

    query += ' LIMIT 15';

    const savings = await SQL_GET_SAVINGS(query)(values).many();
    return res.json(savings);
  });
};
