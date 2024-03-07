import authMiddleware from '../../middleware/auth';
import { Router } from 'express';
import { sql } from '../../db';
import { hasPermission } from '../../middleware/hasPermission';
import { CategorySchema } from '../../types';

const SQL_GET_CATEGORIES = sql<Record<string, never>, CategorySchema>('SELECT * FROM categories');

export default (router: Router) => {
  router.get('/', authMiddleware(), async (req, res) => {
    const loggedInUserID = req.user!.id;
    const loggedInUserRole = req.user!.role;
    if (!hasPermission(req, loggedInUserID, loggedInUserRole)) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const query = SQL_GET_CATEGORIES({});

    if (req.query.user_id) {
      query.extend('WHERE user_id = :user_id', { user_id: req.query.user_id });
    } else if (req.query.system) {
      query.extend('WHERE user_id IS NULL', {});
    }

    query.extend('LIMIT 15', {});

    const result = await query.many();
    return res.json(result);
  });
};
