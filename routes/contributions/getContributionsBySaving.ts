import { Router } from 'express';
import authMiddleware from '../../middleware/auth';
import { HttpError } from '../../middleware/errorMiddleware';
import pool from '../../db';

export default (router: Router) => {
  router.get('/', authMiddleware(), async (req, res) => {
    const saving_id = req.query.saving_id;
    const page = parseInt(String(req.query.page || '1'));
    const pageSize = parseInt(String(req.query.pageSize || '10')) 
    const offset = (page - 1) * pageSize;
    
    if (!saving_id) {
      throw new HttpError(400, 'Saving ID is required');
    }

    const query = 'SELECT * FROM contributions WHERE saving_id = $1 ORDER BY id OFFSET $2 LIMIT $3';
    const values = [saving_id, offset, pageSize];

    const result = await pool.query(query, values);
    const contributions = result.rows || [];
    return res.json(contributions);
  });
};
