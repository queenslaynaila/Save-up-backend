import authMiddleware from '../../middleware/auth';
import { Router } from 'express';
import { sql } from '../../db';
import { hasPermission } from '../../middleware/hasPermission';
import { CategorySchema } from '../../types';

export default (router: Router) => {
  router.get('/', authMiddleware(), async (req, res) => {
    const loggedInUserID = req.user!.id;
    const loggedInUserRole = req.user!.role;
    if (!hasPermission(req, loggedInUserID, loggedInUserRole)) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    let query = 'SELECT * FROM categories';
    const values: (string | null)[] = [];

    if (req.query.user_id) {
      const user_id = req.query.user_id;
      query += ' WHERE user_id = :user_id';
      values.push(user_id as string);
    } else if (req.query.system) {
      query += ' WHERE user_id IS NULL';
    }
    query += ' LIMIT 15';
    const SQL_GET_CATEGORIES = sql<{ user_id?: string }, CategorySchema>(query);
    const result = await SQL_GET_CATEGORIES({ user_id: req.query.user_id as string }).many();
    return res.json(result);
  });
};
