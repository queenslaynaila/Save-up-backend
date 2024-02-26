import { Router } from 'express';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/auth';
import { hasPermission } from '../../middleware/hasPermission';
import { sql } from '../../db';

export default (router: Router) => {
  router.get('/', authMiddleware(), async (req, res) => {
    const { user_id, category_id, month, page, pageSize, order } = req.query as {
      user_id: string;
      category_id?: string;
      month?: string;
      page: string;
      pageSize: string;
      order: string;
    };

    const logged_in_user_role = req.user!.role;
    if (!hasPermission(req, user_id, logged_in_user_role)) {
      throw new HttpError(403, 'Unauthorized access');
    }

    const pageInt = parseInt(page || '1');
    const pageSizeInt = parseInt(pageSize || '10');
    const offset = (pageInt - 1) * pageSizeInt;

    let query = 'SELECT * FROM expenses WHERE user_id = :user_id';
    const values: { [key: string]: string | number } = { user_id };

    if (category_id) {
      query += ' AND category_id = :category_id';
      values.category_id = category_id;
    }

    if (month) {
      query += ' AND EXTRACT(MONTH FROM date) = :month';
      values.month = parseInt(month);
    }

    let orderByClause = ' ORDER BY date';
    if (order && (order === 'asc' || order === 'desc')) {
      orderByClause += ' ' + order.toUpperCase();
    }

    query += orderByClause + ' OFFSET :offset LIMIT :limit';
    values.offset = offset;
    values.limit = pageSizeInt;

    const SQL_GET_EXPENSES = sql(query);
    const results = await SQL_GET_EXPENSES(values).many();
    return res.json(results);
  });
};
