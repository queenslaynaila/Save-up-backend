import authMiddleware from '../../middleware/auth';
import { hasPermission } from '../../middleware/hasPermission';
import { Router } from 'express';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';

export default (router: Router) => {
  router.get('/', authMiddleware(), async (req, res) => {
    const { user_id, priority, status, order, page, pageSize } = req.query as {
      user_id: string;
      priority?: string;
      status?: string;
      order?: string;
      page?: string;
      pageSize?: string;
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

    if (order === 'asc' || order === 'desc') {
      query += ` ORDER BY created_at ${order.toUpperCase()}`;
    }

    if (page && pageSize) {
      const offset = (parseInt(page) - 1) * parseInt(pageSize);
      query += ' LIMIT :limit OFFSET :offset';
      values.limit = pageSize;
      values.offset = offset.toString();
    }

    const SQL_GET_SAVINGS = sql(query);
    const result = await SQL_GET_SAVINGS(values).many();

    return res.json(result);
  });
};
