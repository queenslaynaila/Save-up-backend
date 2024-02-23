import authMiddleware from '../../middleware/auth';
import { Router } from 'express';
import { contributionSchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import pool from '../../db';

export default (router: Router) => {
  router.post('/', authMiddleware(), async (req, res) => {
    const validationResult = contributionSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new HttpError(400, 'Invalid saving id, amount, or date');
    }
    const { saving_id, amount, date } = validationResult.data;
    const contributionQuery = `
            INSERT INTO contributions (saving_id, amount, date)
            VALUES ($1, $2, $3)
            RETURNING *`;
    const contributionValues = [saving_id, amount, date];
    const contributionResult = await pool.query(contributionQuery, contributionValues);
    if (contributionResult.rows.length === 0) {
      throw new HttpError(400, 'Invalid saving id');
    }
    return res.json(contributionResult.rows[0]);
  });
};
