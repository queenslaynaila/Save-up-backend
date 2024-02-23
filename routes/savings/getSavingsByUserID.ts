import authMiddleware from '../../middleware/auth';
import { hasPermission } from '../../middleware/hasPermission';
import { Router } from 'express';
import { HttpError } from '../../middleware/errorMiddleware';
import pool from '../../db';

export default (router: Router) => {
  router.get('/', authMiddleware(), async (req, res) => {
    const { user_id, priority, status, order, page, pageSize } = req.query as { [key: string]: string };

    const logged_in_user_role = req.user!.role; 
    if (!hasPermission(req, user_id, logged_in_user_role)) {
      throw new HttpError(403, 'Unauthorized access');
    }

    let query = 'SELECT * FROM savings WHERE user_id = $1';
    const values = [user_id];
    
    if (priority) {
      query += ' AND priority = $' + (values.length + 1);
      values.push(priority);
    }

    if (status) {
      query += ' AND status = $' + (values.length + 1);
      values.push(status);
    }

    if (order === 'asc' || order === 'desc') {
      query += ` ORDER BY created_at ${order.toUpperCase()}`;
    }

    if (page && pageSize) {
      const offset = (parseInt(page) - 1) * parseInt(pageSize);
      query += ' LIMIT $' + (values.length + 1) + ' OFFSET $' + (values.length + 2);
      values.push(parseInt(pageSize).toString(), offset.toString());
    }

    const result = await pool.query(query, values);
    const savings = result.rows || [];
    return res.json(savings);
  });
};

