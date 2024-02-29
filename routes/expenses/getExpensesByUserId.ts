import { Router } from 'express';
import { HttpError } from '../../middleware/errorMiddleware';
import authMiddleware from '../../middleware/auth';
import { hasPermission } from '../../middleware/hasPermission';
import {  ExtendedExpenseInterface } from '../../types';
import { sql } from '../../db';


const SQL_GET_EXPENSES_BY_USER_ID = (query: string) => sql<{ user_id: string; category_id?: string; month?: string; },ExtendedExpenseInterface>(query);

export default (router: Router) => {
  router.get('/', authMiddleware(), async (req, res) => {
    const { user_id, category_id, month } = req.query as {
      user_id: string;
      category_id?: string;
      month?: string;
    };

    const loggedInUserRole = req.user!.role;
    if (!hasPermission(req, user_id, loggedInUserRole)) {
      throw new HttpError(403, 'Unauthorized access');
    }

    let query = 'SELECT * FROM expenses WHERE user_id = :user_id';
    const values: { user_id: string; category_id?: string; month?: string } = { user_id };

    if (category_id) {
      query += ' AND category_id = :category_id';
      values.category_id = category_id;
    }

    if (month) {
      query += ' AND EXTRACT(MONTH FROM date) = :month';
      values.month = month;
    }

    const results = await SQL_GET_EXPENSES_BY_USER_ID(query)(values).many();
    
    return res.json(results);
  });
};
