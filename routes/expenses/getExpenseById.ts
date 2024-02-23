import authMiddleware from '../../middleware/auth';
import { Router } from 'express';
import { idSchema } from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import pool from '../../db';

export default (router: Router) => {
  router.get(
    '/:id',
    authMiddleware(),
    //validate(),
    async (req, res) => {
      const validationResult = idSchema.safeParse(req.params.id);
      if (!validationResult.success) {
        throw new HttpError(400, 'Invalid data');
      }
      const id = validationResult.data;
      const userId = req.user?.id;
      const query = 'SELECT * FROM expenses WHERE id = $1 AND user_id = $2';
      const result = await pool.query(query, [id, userId]);
      if (result.rows.length === 0) {
        throw new HttpError(404, 'Expense with submitted ID not found');
      }
      return res.json(result.rows[0]);
    }
  );
};
