import { Router } from 'express';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/auth';
import { hasPermission } from '../../middleware/hasPermission';
import pool from '../../db';

export default (router: Router) => {
  router.get('/', authMiddleware(), async (req, res) => {
    const { user_id, category_id, month, page, pageSize, order } = req.query as {
      user_id: string,
      category_id: string,
      month: string,
      page: string,
      pageSize: string,
      order: string
    };
      
    const logged_in_user_role = req.user!.role;
    if (!hasPermission(req, user_id, logged_in_user_role)) {
      throw new HttpError(403, 'Unauthorized access');
    }

    const pageInt = parseInt(String(page || '1'));
    const pageSizeInt = parseInt(String(pageSize || '10'));
    const offset = (pageInt - 1) * pageSizeInt;
    let query = 'SELECT * FROM expenses WHERE user_id = $1';
    const values = [user_id];
    let errorMessage = 'No expenses found for the provided user ID';

    if (category_id) {
      query += ' AND category_id = $' + (values.length + 1);
      values.push(category_id);
    }

    if (month) {
      query += ' AND EXTRACT(MONTH FROM date) = $' + (values.length + 1);
      values.push(month);
    }

    let orderByClause = ' ORDER BY date';
    if (order && (order === 'asc' || order === 'desc')) {
      orderByClause += ' ' + order.toUpperCase();
    }

    query += orderByClause + ' OFFSET $' + (values.length + 1) + ' LIMIT $' + (values.length + 2);
    values.push(offset.toString(), pageSizeInt.toString());

    errorMessage = 'No expenses found for the given query';

    const results = await pool.query(query, values);
    const expenses = results.rows || [];
    return res.json(expenses)
  });
};
