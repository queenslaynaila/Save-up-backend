import { Router } from 'express';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/auth';
import { hasPermission } from '../../middleware/hasPermission';
import { sql } from '../../db';

let baseQuery = 'SELECT * FROM expenses WHERE user_id = :user_id';
const SQL_GET_EXPENSES = sql(baseQuery);

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

    const loggedInUserRole = req.user!.role;
    if (!hasPermission(req, user_id, loggedInUserRole)) {
      throw new HttpError(403, 'Unauthorized access');
    }

    const pageNumber = parseInt(page || '1');
    const itemsPerPage = parseInt(pageSize || '10');
    const offset = (pageNumber - 1) * itemsPerPage;

    const values: { [key: string]: string | number } = { user_id };

    if (category_id) {
      baseQuery += ' AND category_id = :category_id';
      values.category_id = category_id;
    }

    if (month) {
      baseQuery += ' AND EXTRACT(MONTH FROM date) = :month';
      values.month = parseInt(month);
    }

    let orderByClause = ' ORDER BY date';
    if (order && (order === 'asc' || order === 'desc')) {
      orderByClause += ' ' + order.toUpperCase();
    }

    baseQuery += orderByClause + ' OFFSET :offset LIMIT :limit';
    values.offset = offset;
    values.limit = itemsPerPage;

    const results = await SQL_GET_EXPENSES(values).many();
    return res.json(results);
  });
};
