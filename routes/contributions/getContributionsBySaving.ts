import { Router } from 'express';
import authMiddleware from '../../middleware/auth';
import { HttpError } from '../../middleware/errorMiddleware';
import pool from '../../db';

export default (router: Router) => {
  router.get('/', authMiddleware(), async (req, res) => {
    const saving_id = req.query.saving_id;

    if (!saving_id) {
      throw new HttpError(400, 'Saving ID is required');
    }

    const query = 'SELECT * FROM contributions WHERE saving_id = $1';
    const result = await pool.query(query, [saving_id]);
    const contributions = result.rows || [];
    return res.json(contributions);
  });
};
